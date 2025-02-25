import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button, Col, descriptors, localizationKeys } from '../customizables';
import type { LocalizationKey } from '../localization';
import { CardAlert } from './Alert';
import { Card } from './Card';
import { useFieldOTP } from './CodeControl';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Form } from './Form';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';

export type VerificationCodeCardProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  safeIdentifier?: string | undefined | null;
  resendButton?: LocalizationKey;
  profileImageUrl?: string;
  onCodeEntryFinishedAction: (
    code: string,
    resolve: () => Promise<void>,
    reject: (err: unknown) => Promise<void>,
  ) => void;
  onResendCodeClicked?: React.MouseEventHandler;
  showAlternativeMethods?: boolean;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
  onIdentityPreviewEditClicked?: React.MouseEventHandler;
  onBackLinkClicked?: React.MouseEventHandler;
};

export const VerificationCodeCard = (props: PropsWithChildren<VerificationCodeCardProps>) => {
  const { showAlternativeMethods = true, children } = props;
  const card = useCardState();

  const otp = useFieldOTP({
    onCodeEntryFinished: (code, resolve, reject) => {
      props.onCodeEntryFinishedAction(code, resolve, reject);
    },
    onResendCodeClicked: props.onResendCodeClicked,
  });

  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        <Header.Title localizationKey={props.cardTitle} />
        <Header.Subtitle localizationKey={props.cardSubtitle} />
        <IdentityPreview
          identifier={props.safeIdentifier}
          avatarUrl={props.profileImageUrl}
          onClick={!props.onBackLinkClicked ? props.onIdentityPreviewEditClicked : undefined}
        />
      </Header.Root>
      {children}
      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <Form.OTPInput
          {...otp}
          label={props.formTitle}
          description={props.formSubtitle}
          resendButton={props.resendButton}
        />
        <Button
          elementDescriptor={descriptors.formButtonPrimary}
          block
          hasArrow
          localizationKey={localizationKeys('formButtonPrimary')}
          onClick={otp.onFakeContinue}
        />
      </Col>

      {showAlternativeMethods && props.onShowAlternativeMethodsClicked && (
        <Footer.Root>
          <Footer.Action elementId='alternativeMethods'>
            <Footer.ActionLink
              localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
              onClick={props.onShowAlternativeMethodsClicked}
            />
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      )}
    </Card>
  );
};
