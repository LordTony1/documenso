import { describe, expect, it } from 'vitest';

import {
  BASE64_ENCODING_SAFETY_FACTOR,
  estimateEncodedEmailSize,
  exceedsSafeEmailAttachmentSize,
  FIXED_MESSAGE_OVERHEAD_BYTES,
  PER_ATTACHMENT_OVERHEAD_BYTES,
  SMTP_SAFETY_MARGIN_RATIO,
} from './estimate-email-attachment-size';

describe('estimateEncodedEmailSize', () => {
  it('is just the fixed message overhead when there are no attachments', () => {
    expect(estimateEncodedEmailSize(0, 0)).toBe(FIXED_MESSAGE_OVERHEAD_BYTES);
  });

  it('applies the encoding factor plus per-attachment and fixed overhead', () => {
    const rawBytes = 1_000_000;
    const attachmentCount = 3;

    const expected =
      Math.ceil(rawBytes * BASE64_ENCODING_SAFETY_FACTOR) +
      attachmentCount * PER_ATTACHMENT_OVERHEAD_BYTES +
      FIXED_MESSAGE_OVERHEAD_BYTES;

    expect(estimateEncodedEmailSize(rawBytes, attachmentCount)).toBe(expected);
  });
});

describe('exceedsSafeEmailAttachmentSize', () => {
  it('does not flag a small single attachment against a normal server limit', () => {
    const serverLimitBytes = 50_000_000; // 50MB

    expect(exceedsSafeEmailAttachmentSize(1_000_000, 1, serverLimitBytes)).toBe(false);
  });

  it('flags attachments whose raw size is under the limit but whose encoded size is not', () => {
    // This is the actual production bug: a naive raw-byte comparison against
    // the server limit says "fits" (7MB raw < 10MB limit), but base64
    // encoding plus overhead pushes the real message over the safe
    // threshold.
    const rawBytes = 7_000_000;
    const serverLimitBytes = 10_000_000;

    expect(rawBytes).toBeLessThan(serverLimitBytes);
    expect(exceedsSafeEmailAttachmentSize(rawBytes, 1, serverLimitBytes)).toBe(true);
  });

  it('mirrors the production incident: a multi-item envelope well over a 50MB relay limit', () => {
    // envelope_omybobhtwrrtztcc: 6 PDFs totaling ~93MB raw, rejected by a
    // 50MB Exim relay with "552 Message size exceeds maximum permitted".
    const rawBytes = 93_000_000;
    const attachmentCount = 6;
    const serverLimitBytes = 50_000_000;

    expect(exceedsSafeEmailAttachmentSize(rawBytes, attachmentCount, serverLimitBytes)).toBe(true);
  });

  it('accounts for per-attachment overhead scaling across many small attachments', () => {
    // Raw size alone (after the encoding factor) stays under the threshold;
    // it's the accumulated per-attachment overhead that tips it over.
    const rawBytes = 100_000;
    const attachmentCount = 100;

    const withoutPerAttachmentOverhead =
      Math.ceil(rawBytes * BASE64_ENCODING_SAFETY_FACTOR) + FIXED_MESSAGE_OVERHEAD_BYTES;
    const serverLimitBytes = Math.ceil(withoutPerAttachmentOverhead / SMTP_SAFETY_MARGIN_RATIO) + 1;

    // Sanity check: without the per-attachment overhead this case would not
    // exceed the limit.
    expect(withoutPerAttachmentOverhead).toBeLessThanOrEqual(serverLimitBytes * SMTP_SAFETY_MARGIN_RATIO);

    expect(exceedsSafeEmailAttachmentSize(rawBytes, attachmentCount, serverLimitBytes)).toBe(true);
  });

  it('is false exactly at the safety-margin boundary and true just below it', () => {
    const estimate = estimateEncodedEmailSize(2_000_000, 2);
    const exactBoundaryLimit = estimate / SMTP_SAFETY_MARGIN_RATIO;

    expect(exceedsSafeEmailAttachmentSize(2_000_000, 2, exactBoundaryLimit)).toBe(false);
    expect(exceedsSafeEmailAttachmentSize(2_000_000, 2, exactBoundaryLimit - 1)).toBe(true);
  });
});
