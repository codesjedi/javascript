import { useClerk, useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/types';
import React from 'react';

import { runIfFunctionOrReturn } from '../../../utils';
import { NotificationCountBadge, withGate } from '../../common';
import { useEnvironment, useOrganizationSwitcherContext } from '../../contexts';
import { descriptors, Flex, localizationKeys } from '../../customizables';
import {
  Actions,
  ExtraSmallAction,
  OrganizationPreview,
  PersonalWorkspacePreview,
  PopoverCard,
  SmallAction,
  useCardState,
} from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { Billing, CogFilled } from '../../icons';
import { useRouter } from '../../router';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { OrganizationActionList } from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { close: () => void } & PropsOfComponent<typeof PopoverCard.Root>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { close, ...rest } = props;
    const card = useCardState();
    const { openOrganizationProfile, openCreateOrganization } = useClerk();
    const { organization: currentOrg } = useOrganization();
    const { isLoaded, setActive } = useOrganizationList();
    const router = useRouter();
    const {
      hidePersonal,
      //@ts-expect-error
      __unstable_manageBillingUrl,
      //@ts-expect-error
      __unstable_manageBillingLabel,
      //@ts-expect-error
      __unstable_manageBillingMembersLimit,
      createOrganizationMode,
      organizationProfileMode,
      afterLeaveOrganizationUrl,
      afterCreateOrganizationUrl,
      navigateCreateOrganization,
      navigateOrganizationProfile,
      navigateAfterSelectPersonal,
      navigateAfterSelectOrganization,
      organizationProfileProps,
    } = useOrganizationSwitcherContext();

    const { user } = useUser();

    if (!user) {
      return null;
    }

    const { username, primaryEmailAddress, primaryPhoneNumber, ...userWithoutIdentifiers } = user;

    if (!isLoaded) {
      return null;
    }

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card
        .runAsync(() =>
          setActive({
            organization,
            beforeEmit: () => navigateAfterSelectOrganization(organization),
          }),
        )
        .then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card
        .runAsync(() => setActive({ organization: null, beforeEmit: () => navigateAfterSelectPersonal(user) }))
        .then(close);
    };

    const handleCreateOrganizationClicked = () => {
      close();
      if (createOrganizationMode === 'navigation') {
        return navigateCreateOrganization();
      }
      return openCreateOrganization({ afterCreateOrganizationUrl });
    };

    const handleManageOrganizationClicked = () => {
      close();
      if (organizationProfileMode === 'navigation') {
        return navigateOrganizationProfile();
      }
      return openOrganizationProfile({
        ...organizationProfileProps,
        afterLeaveOrganizationUrl,
        //@ts-expect-error
        __unstable_manageBillingUrl,
        __unstable_manageBillingLabel,
        __unstable_manageBillingMembersLimit,
      });
    };

    const manageOrganizationSmallIconButton = (
      <ExtraSmallAction
        elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        icon={CogFilled}
        onClick={handleManageOrganizationClicked}
        trailing={<NotificationCountBadgeManageButton />}
      />
    );

    const manageOrganizationButton = (
      <SmallAction
        elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
        trailing={<NotificationCountBadgeManageButton sx={{ right: 0 }} />}
      />
    );

    const billingOrganizationButton = (
      <SmallAction
        icon={Billing}
        label={runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Upgrade'}
        onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
      />
    );

    const selectedOrganizationPreview = (currentOrg: OrganizationResource) =>
      __unstable_manageBillingUrl ? (
        <>
          <OrganizationPreview
            elementId={'organizationSwitcherActiveOrganization'}
            organization={currentOrg}
            user={user}
            mainIdentifierVariant='buttonLarge'
            sx={t => ({
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
          />
          <Actions
            role='menu'
            sx={t => ({ borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}` })}
          >
            <Flex
              justify='between'
              sx={t => ({ marginLeft: t.space.$12, padding: `0 ${t.space.$5} ${t.space.$4}`, gap: t.space.$2 })}
            >
              {manageOrganizationButton}
              {billingOrganizationButton}
            </Flex>
          </Actions>
        </>
      ) : (
        <Flex
          justify='between'
          align='center'
          sx={t => ({
            width: '100%',
            paddingRight: t.space.$5,
            borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
          })}
        >
          <OrganizationPreview
            elementId={'organizationSwitcherActiveOrganization'}
            organization={currentOrg}
            user={user}
            mainIdentifierVariant='buttonLarge'
            sx={t => ({
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
          />
          <Actions role='menu'>{manageOrganizationSmallIconButton}</Actions>
        </Flex>
      );

    return (
      <RootBox elementDescriptor={descriptors.organizationSwitcherPopoverRootBox}>
        <PopoverCard.Root
          elementDescriptor={descriptors.organizationSwitcherPopoverCard}
          ref={ref}
          role='dialog'
          aria-label={`${currentOrg?.name} is active`}
          {...rest}
        >
          <PopoverCard.Main elementDescriptor={descriptors.organizationSwitcherPopoverMain}>
            {currentOrg
              ? selectedOrganizationPreview(currentOrg)
              : !hidePersonal && (
                  <PersonalWorkspacePreview
                    user={userWithoutIdentifiers}
                    sx={t => ({
                      padding: `${t.space.$4} ${t.space.$5}`,
                      borderBottom: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
                    })}
                    title={localizationKeys('organizationSwitcher.personalWorkspace')}
                  />
                )}
            <OrganizationActionList
              onCreateOrganizationClick={handleCreateOrganizationClicked}
              onPersonalWorkspaceClick={handlePersonalWorkspaceClicked}
              onOrganizationClick={handleOrganizationClicked}
            />
          </PopoverCard.Main>
          <PopoverCard.Footer elementDescriptor={descriptors.organizationSwitcherPopoverFooter} />
        </PopoverCard.Root>
      </RootBox>
    );
  },
);

const NotificationCountBadgeManageButton = withGate(
  ({ sx }: { sx?: ThemableCssProp }) => {
    const { organizationSettings } = useEnvironment();

    const isDomainsEnabled = organizationSettings?.domains?.enabled;

    const { membershipRequests } = useOrganization({
      membershipRequests: isDomainsEnabled || undefined,
    });

    return (
      <NotificationCountBadge
        notificationCount={membershipRequests?.count || 0}
        containerSx={sx}
      />
    );
  },
  {
    // if the user is not able to accept a request we should not notify them
    permission: 'org:sys_memberships:manage',
  },
);
