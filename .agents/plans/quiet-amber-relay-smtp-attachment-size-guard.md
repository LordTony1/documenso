---
date: 2026-08-20
title: SMTP-safe completed-document email attachments
---

## Summary

`send-document-completed-emails.handler.ts` always attached every signed PDF in an envelope to the "document completed" email, for both the owner and every recipient. Self-hosted SMTP relays reject oversized messages — confirmed in production: `envelope_omybobhtwrrtztcc` (6 PDFs, ~93MB raw) sent to a real recipient repeatedly failed with `552 Message size exceeds maximum permitted` from this deployment's Exim relay (50MB limit). nodemailer base64-encodes attachment content by default (~33-37% wire-size inflation over raw bytes, plus MIME overhead), so a naive raw-byte check against the relay's limit still under-estimates and still 552s.

Fix: estimate the encoded message size with a deliberately pessimistic, two-layer safety margin, and when it would exceed the configured SMTP limit, omit the PDF attachments and rely on the download link the email already includes (`downloadLink` for recipients → `/sign/{token}/complete`, `documentOwnerDownloadLink` for the owner → `/documents/{id}`), with a short note explaining why there's no attachment.

This is this fork's first larger deviation from upstream Documenso, so the change is deliberately isolated: the estimation math lives in a new, independently-testable file; the handler and template only get small surgical edits with explicit "fork-specific, don't strip this" comments at every touch point.

## Design

New pure module `packages/lib/utils/estimate-email-attachment-size.ts` — two independent safety margins, not one point estimate:

1. **Encoding-overhead margin**: 1.40× raw bytes (theoretical base64 expansion is 1.333×; nodemailer's 76-char line-wrapping pushes real-world expansion to ~1.37×; rounded up further so a few points of estimation error can't flip the decision) + 1024 bytes/attachment (MIME headers/boundaries) + 10KB fixed (message headers + HTML/text bodies).
2. **Configured-limit margin**: only ever use up to 90% of the configured server limit — hedges a *different* uncertainty (is the configured limit itself exact) than margin #1 (is the encoding math right).

```ts
export const BASE64_ENCODING_SAFETY_FACTOR = 1.4;
export const PER_ATTACHMENT_OVERHEAD_BYTES = 1024;
export const FIXED_MESSAGE_OVERHEAD_BYTES = 10 * 1024;
export const SMTP_SAFETY_MARGIN_RATIO = 0.9;

export const estimateEncodedEmailSize = (rawAttachmentBytes: number, attachmentCount: number) => ...
export const exceedsSafeEmailAttachmentSize = (rawAttachmentBytes: number, attachmentCount: number, serverLimitBytes: number) => ...
```

Takes primitives (bytes/count), not nodemailer attachment objects, to keep `packages/lib/utils` free of a nodemailer type dependency and keep the function trivially unit-testable.

The server limit itself is a new env var, `NEXT_PRIVATE_SMTP_MAX_MESSAGE_SIZE_MB` (default 25MB — a safe universal default, e.g. Gmail's own inbound limit, since most self-hosters won't configure this and relay defaults vary), following the exact `Number(env(...)) || default` idiom already used for `APP_DOCUMENT_UPLOAD_SIZE_LIMIT`.

`shouldOmitAttachments` is computed once per envelope (mirrors how `completedDocumentEmailAttachments` itself is already built once and reused across the owner email and every recipient email) — the decision is envelope-level, not per-recipient, since the message size is the same regardless of who receives it.

## Files

- `packages/lib/utils/estimate-email-attachment-size.ts` (new) — the estimation functions, heavily commented on WHY (the production 552 root cause, why two independent margins).
- `packages/lib/utils/estimate-email-attachment-size.test.ts` (new) — vitest, no mocks. Covers: zero attachments, a small attachment well under the limit, the actual bug (raw bytes under the limit but the encoded estimate isn't), a scaled-down version of the real production incident, per-attachment overhead accumulating across many small attachments, and the exact safety-margin boundary.
- `packages/lib/constants/email.ts` — `SMTP_MAX_MESSAGE_SIZE_MB`, stored as raw MB and converted via the existing `megabytesToBytes()` helper (`packages/lib/universal/unit-convertions.ts`) at the call site, not pre-converted to bytes in the constant.
- `.env.example`, `packages/tsconfig/process-env.d.ts`, `turbo.json` — new env var registered in all three (the standard 3-place plumbing for a new `NEXT_PRIVATE_*` var in this repo).
- `packages/email/template-components/template-document-completed.tsx` — new optional `attachmentOmitted?: boolean` prop, rendering a short note after the download button when true.
- `packages/email/templates/document-completed.tsx` — threads `attachmentOmitted` through (already `Partial<TemplateDocumentCompletedProps>`, no extra type work needed).
- `packages/lib/translations/hr/web.po` — Croatian translation for the new note string, added by hand (single string, no need for the batch machine-translate script).
- `packages/lib/jobs/definitions/emails/send-document-completed-emails.handler.ts` — the one inline edit to a shared/upstream-touched file: computes `totalRawAttachmentBytes` from the already-fetched `completedDocumentEmailAttachments` (no new fetch or DB query — `getFileServerSide` already fully materializes every envelope item today, regardless of outcome), calls `exceedsSafeEmailAttachmentSize`, logs via the same `io.logger.warn({...})` style already used in this file for the CC-quota case, and threads `shouldOmitAttachments` into both `createElement(...)` calls (`attachmentOmitted`) and both `sendMail(...)` calls (`attachments: shouldOmitAttachments ? [] : completedDocumentEmailAttachments`).
- `CLAUDE.md` — new bullet in "Fork-specific" documenting the behavior and warning not to strip it on a future upstream merge; also fixed the stale "Agent workflow files" line referencing the now-deleted `scripts/create-plan.ts` generator (removed by an unrelated upstream merge, `chore: remove planning skills`, pulled into this fork earlier the same day).

## Verification

1. `npm run test -w @documenso/lib` — 7 new unit tests pass (`estimate-email-attachment-size.test.ts`), including the "raw-under-limit-but-encoded-over" case that reproduces the actual bug.
2. `npm run typecheck -w @documenso/remix` (`react-router typegen && tsc`) — clean.
3. Manual, on the local dev server + Inbucket (same setup used earlier this session): temporarily set `NEXT_PRIVATE_SMTP_MAX_MESSAGE_SIZE_MB` very low, send a completed document, confirm the email arrives without the PDF attachment, with a working download link and the new note text; confirm the `io.logger.warn` line appears; then restore the env var and confirm a normal-sized document still gets its attachment as before (regression check).

## Out of Scope / Follow-ups

- Raising the actual Exim `message_size_limit` on the hosting side — separate infra request; this guard is a safety net regardless of what that limit is, not a replacement for it.
- Applying the same guard elsewhere — confirmed via repo-wide grep that `send-document-completed-emails.handler.ts` is the only place that attaches a PDF to an email; nothing else needs this.
- A per-document/org toggle to force link-only or force-attach — not requested; behavior is purely automatic based on calculated size.
- Skipping the `getFileServerSide` fetch entirely when attachments will be omitted (would need a cheap size pre-check — DB `octet_length` or S3 `HeadObjectCommand`, neither exists today) — a real optimization, but separate in scope from fixing the 552s.
- **Required deployment step, not code**: after shipping, set `NEXT_PRIVATE_SMTP_MAX_MESSAGE_SIZE_MB=50` in the production `.env` (matching the current MyDataKnox Exim limit) and restart — otherwise the conservative 25MB default starts omitting attachments on documents well under the real 50MB relay limit.
