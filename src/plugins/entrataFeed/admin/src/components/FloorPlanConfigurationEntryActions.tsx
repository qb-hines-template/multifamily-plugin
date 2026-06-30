import { useState } from 'react';
import { Button, Flex } from '@strapi/design-system';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';
import {
  ENGRAIN_SYNC_PATH,
  FLOOR_PLAN_CONFIGURATION_MODEL,
  FLOORPLAN_SYNC_S3_PATH,
} from '../utils/floorPlanConfiguration/constants';

type FloorPlanConfigurationEntryActionsProps = {
  slug?: string;
};

type FloorPlanConfigurationDocument = {
  documentId?: string;
  enableEngrainPricing?: boolean;
  engrainPrice?: string;
};

const FloorPlanConfigurationEntryActions = ({ slug }: FloorPlanConfigurationEntryActionsProps) => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isSyncingEngrain, setIsSyncingEngrain] = useState(false);
  const [isSyncingS3, setIsSyncingS3] = useState(false);

  if (slug !== FLOOR_PLAN_CONFIGURATION_MODEL) {
    return null;
  }

  const loadFloorPlanConfiguration = async () => {
    const { data } = await get<{ data?: FloorPlanConfigurationDocument }>(
      `/content-manager/single-types/${FLOOR_PLAN_CONFIGURATION_MODEL}?status=draft`,
    );

    return data.data ?? (data as FloorPlanConfigurationDocument);
  };

  const handleSyncEngrain = async () => {
    setIsSyncingEngrain(true);

    try {
      const configuration = await loadFloorPlanConfiguration();

      await post(ENGRAIN_SYNC_PATH, {
        documentId: configuration.documentId,
        enableEngrainPricing: configuration.enableEngrainPricing,
        engrainPrice: configuration.engrainPrice,
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
      await post(FLOORPLAN_SYNC_S3_PATH);
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

export { FloorPlanConfigurationEntryActions };
