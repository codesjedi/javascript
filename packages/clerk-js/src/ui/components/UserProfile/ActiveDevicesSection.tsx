import { useSession, useUser } from '@clerk/shared/react';
import type { SessionWithActivitiesResource } from '@clerk/types';
import React from 'react';

import { Badge, Col, descriptors, Flex, Icon, localizationKeys, Text, useLocalizations } from '../../customizables';
import { FullHeightLoader, ProfileSection } from '../../elements';
import { DeviceLaptop, DeviceMobile } from '../../icons';
import { mqu } from '../../styledSystem';
import { getRelativeToNowDateKey } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { currentSessionFirst } from './utils';

export const ActiveDevicesSection = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [sessionsWithActivities, setSessionsWithActivities] = React.useState<SessionWithActivitiesResource[]>([]);

  React.useEffect(() => {
    void user?.getSessions().then(sa => setSessionsWithActivities(sa));
  }, [user]);

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.activeDevicesSection.title')}
      id='activeDevices'
    >
      {!sessionsWithActivities.length && <FullHeightLoader />}
      {!!sessionsWithActivities.length &&
        sessionsWithActivities.sort(currentSessionFirst(session!.id)).map(sa => (
          <DeviceAccordion
            key={sa.id}
            session={sa}
          />
        ))}
    </ProfileSection>
  );
};

const DeviceAccordion = (props: { session: SessionWithActivitiesResource }) => {
  const isCurrent = useSession().session?.id === props.session.id;
  const revoke = async () => {
    if (isCurrent || !props.session) {
      return;
    }
    return props.session.revoke();
  };

  return (
    <UserProfileAccordion
      elementDescriptor={descriptors.activeDeviceListItem}
      elementId={isCurrent ? descriptors.activeDeviceListItem.setId('current') : undefined}
      title={<DeviceInfo session={props.session} />}
    >
      <Col gap={4}>
        {isCurrent && (
          <LinkButtonWithDescription
            subtitle={localizationKeys('userProfile.start.activeDevicesSection.detailsSubtitle')}
            title={localizationKeys('userProfile.start.activeDevicesSection.detailsTitle')}
          />
        )}
        {!isCurrent && (
          <LinkButtonWithDescription
            actionLabel={localizationKeys('userProfile.start.activeDevicesSection.destructiveAction')}
            variant='linkDanger'
            onClick={revoke}
            subtitle={localizationKeys('userProfile.start.activeDevicesSection.destructiveActionSubtitle')}
            title={localizationKeys('userProfile.start.activeDevicesSection.destructiveActionTitle')}
          />
        )}
      </Col>
    </UserProfileAccordion>
  );
};

const DeviceInfo = (props: { session: SessionWithActivitiesResource }) => {
  const { session } = useSession();
  const isCurrent = session?.id === props.session.id;
  const isCurrentlyImpersonating = !!session?.actor;
  const isImpersonationSession = !!props.session.actor;
  const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = props.session.latestActivity;
  const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';
  const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';
  const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;
  const { t } = useLocalizations();

  return (
    <Flex
      elementDescriptor={descriptors.activeDevice}
      elementId={isCurrent ? descriptors.activeDevice.setId('current') : undefined}
      align='center'
      sx={t => ({
        gap: t.space.$8,
        [mqu.xs]: { gap: t.space.$2 },
      })}
    >
      <Flex
        center
        sx={theme => ({
          padding: `0 ${theme.space.$3}`,
          [mqu.sm]: { padding: `0` },
          borderRadius: theme.radii.$md,
        })}
      >
        <Icon
          elementDescriptor={descriptors.activeDeviceIcon}
          elementId={descriptors.activeDeviceIcon.setId(isMobile ? 'mobile' : 'desktop')}
          icon={isMobile ? DeviceMobile : DeviceLaptop}
          sx={theme => ({
            '--cl-chassis-bottom': '#444444',
            '--cl-chassis-back': '#343434',
            '--cl-chassis-screen': '#575757',
            '--cl-screen': '#000000',
            width: theme.space.$20,
            height: theme.space.$20,
            [mqu.sm]: {
              width: theme.space.$10,
              height: theme.space.$10,
            },
          })}
        />
      </Flex>
      <Col
        align='start'
        gap={1}
      >
        <Flex
          center
          gap={2}
        >
          <Text>{title}</Text>
          {isCurrent && (
            <Badge
              localizationKey={localizationKeys('badge__thisDevice')}
              colorScheme={isCurrentlyImpersonating ? 'danger' : 'primary'}
            />
          )}
          {isCurrentlyImpersonating && !isImpersonationSession && (
            <Badge localizationKey={localizationKeys('badge__userDevice')} />
          )}
          {!isCurrent && isImpersonationSession && (
            <Badge
              localizationKey={localizationKeys('badge__otherImpersonatorDevice')}
              colorScheme='danger'
            />
          )}
        </Flex>
        <Text colorScheme='neutral'>{browser}</Text>
        <Text colorScheme='neutral'>
          {ipAddress} ({location})
        </Text>
        <Text colorScheme='neutral'>{t(getRelativeToNowDateKey(props.session.lastActiveAt))}</Text>
      </Col>
    </Flex>
  );
};
