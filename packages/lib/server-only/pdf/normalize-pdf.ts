import { PDF } from '@libpdf/core';

import { AppError } from '../../errors/app-error';
import { hasExistingSignatures } from './preserve-existing-signatures';

export const normalizePdf = async (pdf: Buffer, options: { flattenForm?: boolean } = {}) => {
  const shouldFlattenForm = options.flattenForm ?? true;

  const pdfDoc = await PDF.load(pdf).catch((e) => {
    console.error(`PDF normalization error: ${e.message}`);

    throw new AppError('INVALID_DOCUMENT_FILE', {
      message: 'The document is not a valid PDF or is password protected',
    });
  });

  // Rewriting a signed PDF (flattening, decrypting or a plain full save)
  // invalidates its signatures, so it is stored byte for byte.
  if (hasExistingSignatures(pdfDoc)) {
    return pdf;
  }

  if (pdfDoc.isEncrypted) {
    if (!pdfDoc.isAuthenticated) {
      throw new AppError('INVALID_DOCUMENT_FILE', {
        message: 'The document is password protected',
      });
    }

    pdfDoc.removeProtection({ ignorePermissions: true });
  }

  pdfDoc.flattenLayers();

  const form = pdfDoc.getForm();

  if (shouldFlattenForm && form) {
    form.flatten();
    pdfDoc.flattenAnnotations();
  }

  const normalizedPdfBytes = await pdfDoc.save();

  return Buffer.from(normalizedPdfBytes);
};
