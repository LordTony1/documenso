import type { PDF, PDFEmbeddedPage, PDFPage, SignatureField } from '@libpdf/core';
import { AnnotationFlags, PdfArray, PdfDict, PdfName, PdfNumber, PdfStream, PdfString } from '@libpdf/core';
import { nanoid } from 'nanoid';

const toPdfDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `D:${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

/**
 * Whether the PDF carries at least one applied digital signature (e.g. a
 * qualified signature added before upload).
 *
 * Such a PDF must only ever be extended with incremental updates: any full
 * rewrite, flattening or header change breaks the signed byte ranges.
 */
export const hasExistingSignatures = (pdf: PDF) => {
  const form = pdf.getForm();

  if (!form) {
    return false;
  }

  return form.getFields().some((field) => field.type === 'signature' && (field as SignatureField).isSigned());
};

type StampOverlayOnPageOptions = {
  pdf: PDF;
  page: PDFPage;
  overlay: PDFEmbeddedPage;
  translateX: number;
  translateY: number;
};

/**
 * Show an overlay page on top of `page` as a locked Stamp annotation instead of
 * drawing it into the page content.
 *
 * Adding annotations is a change that validators accept after an approval
 * signature, whereas editing the page content stream is not. The transform
 * mirrors `page.drawPage(overlay, { x, y, rotate })` so the result lands where
 * the content-stream path would have drawn it.
 */
export const stampOverlayOnPage = ({ pdf, page, overlay, translateX, translateY }: StampOverlayOnPageOptions) => {
  const radians = (page.rotation * Math.PI) / 180;
  const cos = Math.round(Math.cos(radians));
  const sin = Math.round(Math.sin(radians));

  const appearance = pdf.context.resolve(overlay.ref);

  if (!(appearance instanceof PdfStream)) {
    throw new Error('Embedded overlay is not a Form XObject stream');
  }

  appearance.set(
    'Matrix',
    PdfArray.of(
      PdfNumber.of(cos),
      PdfNumber.of(sin),
      PdfNumber.of(-sin),
      PdfNumber.of(cos),
      PdfNumber.of(translateX),
      PdfNumber.of(translateY),
    ),
  );

  // The annotation rect must equal the overlay's bbox after the matrix,
  // otherwise viewers rescale the appearance to fit the rect.
  const { x, y, width, height } = overlay.box;

  const corners = [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height],
  ].map(([cx, cy]) => [cos * cx - sin * cy + translateX, sin * cx + cos * cy + translateY]);

  const xs = corners.map(([cx]) => cx);
  const ys = corners.map(([, cy]) => cy);

  const now = toPdfDate(new Date());

  // NM, M, CreationDate and T are optional, but Acrobat fills in whichever
  // ones are missing on a markup annotation when it opens the file and then
  // lists that as "Annotations Modified" after the seal signature.
  const stampDict = PdfDict.of({
    Type: PdfName.of('Annot'),
    Subtype: PdfName.of('Stamp'),
    Name: PdfName.of('DocumensoFields'),
    NM: PdfString.fromString(`documenso-fields-${nanoid()}`),
    T: PdfString.fromString('Documenso'),
    M: PdfString.fromString(now),
    CreationDate: PdfString.fromString(now),
    Rect: PdfArray.of(
      PdfNumber.of(Math.min(...xs)),
      PdfNumber.of(Math.min(...ys)),
      PdfNumber.of(Math.max(...xs)),
      PdfNumber.of(Math.max(...ys)),
    ),
    F: PdfNumber.of(AnnotationFlags.Print | AnnotationFlags.Locked | AnnotationFlags.LockedContents),
    P: page.ref,
    AP: PdfDict.of({ N: overlay.ref }),
  });

  const stampRef = pdf.context.register(stampDict);

  // Append by hand: libpdf's own annotation helpers read /Annots without
  // resolving an indirect array and then replace it, dropping the existing
  // signature widgets from the page.
  const existingAnnots = page.dict.getArray('Annots', pdf.context.registry.resolve.bind(pdf.context.registry));

  page.dict.set('Annots', PdfArray.of(...(existingAnnots?.toArray() ?? []), stampRef));
};
