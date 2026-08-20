/**
 * Fork-specific: self-hosted SMTP relays (this deployment's is Exim, via the
 * hosting provider) commonly enforce a message-size limit well below what a
 * multi-file signed envelope needs — see the production `552 Message size
 * exceeds maximum permitted` rejections this caused for a 6-item, ~93MB
 * envelope.
 *
 * nodemailer base64-encodes `Buffer` attachment content for MIME transport,
 * which inflates the wire size ~33-37% beyond the raw PDF bytes (plus MIME
 * headers/boundaries). Comparing raw attachment bytes directly against the
 * server's configured limit therefore under-estimates the real message size
 * and still gets rejected.
 *
 * The margins below are deliberately pessimistic and layered independently,
 * so a small error in one doesn't flip the decision the wrong way:
 * being wrong in the "send a link instead" direction just means an
 * unnecessary (but harmless) fallback; being wrong in the "attach anyway"
 * direction means a hard send failure nobody notices until logs are checked.
 */

// Base64 expands binary 4/3 (~33.3%). Nodemailer additionally line-wraps at
// 76 chars with a CRLF, adding ~2.6% more (real-world expansion is closer to
// ~1.37x). Rounded up to 1.40 rather than relying on that exact figure, so a
// few points of estimation error don't flip the decision the wrong way.
export const BASE64_ENCODING_SAFETY_FACTOR = 1.4;

// Generous allowance for each attachment's Content-Type /
// Content-Disposition / Content-Transfer-Encoding headers and MIME boundary
// delimiters (typically 200-400 bytes in practice).
export const PER_ATTACHMENT_OVERHEAD_BYTES = 1024;

// Generous allowance for the message's own headers plus the HTML/plain-text
// body parts.
export const FIXED_MESSAGE_OVERHEAD_BYTES = 10 * 1024;

// A second, independent margin on top of the (already pessimistic) estimate
// above — hedges against the configured limit itself being optimistic (e.g.
// intermediate relay hops adding their own headers before the size is
// checked), not against the encoding math being wrong. Only ever use up to
// this fraction of the configured server limit.
export const SMTP_SAFETY_MARGIN_RATIO = 0.9;

/**
 * Pessimistic estimate of the actual on-the-wire MIME message size for a set
 * of attachments, given their combined raw (pre-encoding) byte size and how
 * many separate attachments there are.
 */
export const estimateEncodedEmailSize = (rawAttachmentBytes: number, attachmentCount: number): number => {
  return (
    Math.ceil(rawAttachmentBytes * BASE64_ENCODING_SAFETY_FACTOR) +
    attachmentCount * PER_ATTACHMENT_OVERHEAD_BYTES +
    FIXED_MESSAGE_OVERHEAD_BYTES
  );
};

/**
 * Whether attaching these files to an email would likely be rejected by an
 * SMTP relay enforcing `serverLimitBytes` as its message-size limit.
 */
export const exceedsSafeEmailAttachmentSize = (
  rawAttachmentBytes: number,
  attachmentCount: number,
  serverLimitBytes: number,
): boolean => {
  return estimateEncodedEmailSize(rawAttachmentBytes, attachmentCount) > serverLimitBytes * SMTP_SAFETY_MARGIN_RATIO;
};
