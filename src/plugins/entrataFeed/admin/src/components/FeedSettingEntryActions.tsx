import { useState } from 'react';
import { Button, Flex } from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';
import {
  FEED_SETTING_MODEL,
  FEED_SETTING_SYNC_ENGRAIN_PATH,
  FEED_SETTING_SYNC_S3_PATH,
} from '../utils/feedSetting/constants';

type FeedSettingEntryActionsProps = {
  slug?: string;
};

type FeedSettingDocument = {
  documentId?: string;
  enableEngrainPricing?: boolean;
  engrainApiUrl?: string;
  engrainPrice?: string;
};

const FeedSettingEntryActions = ({ slug }: FeedSettingEntryActionsProps) => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isSyncingEngrain, setIsSyncingEngrain] = useState(false);
  const [isSyncingS3, setIsSyncingS3] = useState(false);

  if (slug !== FEED_SETTING_MODEL) {
    return null;
  }

  const loadFeedSetting = async () => {
    const { data } = await get<{ data?: FeedSettingDocument }>(
      `/content-manager/single-types/${FEED_SETTING_MODEL}?status=draft`,
    );

    return data.data ?? (data as FeedSettingDocument);
  };

  const handleSyncEngrain = async () => {
    setIsSyncingEngrain(true);

    try {
      const setting = await loadFeedSetting();

      await post(FEED_SETTING_SYNC_ENGRAIN_PATH, {
          documentId: setting.documentId,
          enableEngrainPricing: setting.enableEngrainPricing,
          engrainApiUrl: setting.engrainApiUrl,
          engrainPrice: setting.engrainPrice,
      });

      toggleNotification({
        type: 'success',
        message: formatMessage({ id: getTranslation('feedSetting.sync.success') }),
      });
      window.location.reload();
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({ id: getTranslation('feedSetting.sync.error') }),
      });
    } finally {
      setIsSyncingEngrain(false);
    }
  };

  const handleSyncS3 = async () => {
    setIsSyncingS3(true);

    try {
      await post(FEED_SETTING_SYNC_S3_PATH);
      toggleNotification({
        type: 'success',
        message: formatMessage({ id: getTranslation('feedSetting.syncS3.success') }),
      });
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({ id: getTranslation('feedSetting.syncS3.error') }),
      });
    } finally {
      setIsSyncingS3(false);
    }
  };

  const isBusy = isSyncingEngrain || isSyncingS3;

  return (
    <Flex direction="column" gap={2} width="100%">
      <Button
        variant="secondary"
        fullWidth
        onClick={handleSyncEngrain}
        loading={isSyncingEngrain}
        disabled={isBusy && !isSyncingEngrain}
      >
        {formatMessage({ id: getTranslation('feedSetting.sync') })}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        onClick={handleSyncS3}
        loading={isSyncingS3}
        disabled={isBusy && !isSyncingS3}
      >
        {formatMessage({ id: getTranslation('feedSetting.syncS3') })}
      </Button>
    </Flex>
  );
};

export { FeedSettingEntryActions };
