import { Trans } from '@lingui/react/macro';

import { Button, Column, Img, Section, Text } from '../components';
import { getEmailAssetUrl } from '../utils/asset-url';
import { TemplateDocumentImage } from './template-document-image';

export interface TemplateDocumentCompletedProps {
  downloadLink: string;
  documentName: string;
  assetBaseUrl: string;
  customBody?: string;
  /**
   * Fork-specific: set when the signed PDF(s) were too large to attach
   * safely to this email (see
   * packages/lib/utils/estimate-email-attachment-size.ts). Don't drop this
   * prop if upstream reworks this template — the handler still needs a way
   * to tell the recipient why there's no attachment.
   */
  attachmentOmitted?: boolean;
}

export const TemplateDocumentCompleted = ({
  downloadLink,
  documentName,
  assetBaseUrl,
  customBody,
  attachmentOmitted,
}: TemplateDocumentCompletedProps) => {
  return (
    <>
      <TemplateDocumentImage className="mt-6" assetBaseUrl={assetBaseUrl} />

      <Section>
        <Section className="mb-4">
          <Column align="center">
            <Text className="font-semibold text-base text-foreground">
              <Img
                src={getEmailAssetUrl('/static/completed.png', assetBaseUrl)}
                className="-mt-0.5 mr-2 inline h-7 w-7 align-middle"
                alt=""
              />
              <Trans>Completed</Trans>
            </Text>
          </Column>
        </Section>

        <Text className="mb-0 text-center font-semibold text-foreground text-lg">
          {customBody || <Trans>“{documentName}” was signed by all signers</Trans>}
        </Text>

        <Text className="my-1 text-center text-base text-muted-foreground">
          <Trans>Continue by downloading the document.</Trans>
        </Text>

        <Section className="mt-8 mb-6 text-center">
          <Button
            className="rounded-lg border border-border border-solid px-4 py-2 text-center font-medium text-foreground text-sm no-underline"
            href={downloadLink}
          >
            <Img
              src={getEmailAssetUrl('/static/download.png', assetBaseUrl)}
              className="mr-2 mb-0.5 inline h-5 w-5 align-middle"
              alt=""
            />
            <Trans>Download</Trans>
          </Button>
        </Section>

        {attachmentOmitted && (
          <Text className="my-1 text-center text-base text-muted-foreground">
            <Trans>The signed document was too large to attach directly — use the button above to download it.</Trans>
          </Text>
        )}
      </Section>
    </>
  );
};

export default TemplateDocumentCompleted;
