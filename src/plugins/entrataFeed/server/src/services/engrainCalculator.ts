import { getEngrainData } from '../utils/engrain/engrainCalculator';
import { FEED_SETTING_UID } from '../constants/api-constants';

const findFeedSetting = async () => {
  const draft = await strapi.documents(FEED_SETTING_UID).findFirst({
    status: 'draft',
  });

  if (draft) {
    return draft;
  }

  return strapi.documents(FEED_SETTING_UID).findFirst({
    status: 'published',
  });
};

const saveFeedSetting = async (data: Record<string, unknown>) => {
  const documentId = data.documentId as string | undefined;
  const { documentId: _documentId, ...fields } = data;

  if (documentId) {
    return strapi.documents(FEED_SETTING_UID).update({
      documentId,
      data: fields as never,
      status: 'draft',
    });
  }

  const existing = await findFeedSetting();

  if (existing) {
    return strapi.documents(FEED_SETTING_UID).update({
      documentId: existing.documentId,
      data: fields as never,
      status: 'draft',
    });
  }

  return strapi.documents(FEED_SETTING_UID).create({
    data: fields,
    status: 'draft',
  });
};

const updateEngrainPrice = async (data: Record<string, unknown> = {}) => {
  const documentId = data.documentId as string | undefined;

  if (Object.keys(data).length > 0) {
    await saveFeedSetting(data);
  }

  const feedSetting = documentId
    ? (await strapi.documents(FEED_SETTING_UID).findOne({ documentId, status: 'draft' })) ??
      (await strapi.documents(FEED_SETTING_UID).findOne({ documentId, status: 'published' }))
    : await findFeedSetting();

  if (!feedSetting) {
    throw new Error('Feed settings not found');
  }

  if (!feedSetting.enableEngrainPricing) {
    throw new Error('Engrain pricing is disabled');
  }

  const engrainPrice = await getEngrainData(feedSetting);

  return {
    message: 'Engrain price synced',
    engrainPrice: '$' + engrainPrice.toString(),
  };
};

export default {
  updateEngrainPrice,
};
