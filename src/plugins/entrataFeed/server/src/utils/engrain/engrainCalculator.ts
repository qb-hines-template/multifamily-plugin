import { FEED_SETTING_UID } from '../../constants/api-constants';

const formatEngrainPrice = (engrainPriceData: string | number) =>
  '$' + engrainPriceData.toString();

const pushEngrainPrice = async (documentId: string, engrainPriceData: string | number) => {
  const engrainPrice = formatEngrainPrice(engrainPriceData);

  await strapi.documents(FEED_SETTING_UID).update({
    documentId,
    data: { engrainPrice } as never,
    status: 'published',
  });
};

const getEngrainData = async (responseData: {
  engrainApiUrl?: string;
  documentId?: string;
}) => {
  const apiUrl = responseData.engrainApiUrl || process.env.ENGRAIN_API_URL;

  if (!apiUrl) {
    throw new Error('Engrain API URL is not configured');
  }

  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured');
  }

  const res = await fetch(apiUrl, {
    headers: {
      'api-key': process.env.API_KEY,
      'Experimental-Flags': process.env.EXPERIMENTAL_FLAGS ?? '',
    },
  });

  if (!res.ok) {
    throw new Error(`Engrain API request failed with status ${res.status}`);
  }

  const response = (await res.json()) as { data?: unknown[] };
  const data = Array.isArray(response?.data) ? response.data : [];
  let amount = 0;
  let minAmount = 0;
  let maxAmount = 0;

  data.forEach((el: any) => {
    if (el.is_required && el.is_enabled && el.frequency === 'monthly' && el.value_type !== 'text') {
      if (el.value_type === 'amount') {
        amount += parseFloat(el.amount) || 0;
      }

      if (el.value_type === 'range') {
        minAmount += parseFloat(el.min_amount) || 0;
        maxAmount += parseFloat(el.max_amount) || 0;
      }
    }
  });

  const engrainPriceData = buildEngrainPrice(amount, minAmount, maxAmount);

  if (responseData.documentId) {
    await pushEngrainPrice(responseData.documentId, engrainPriceData);
  }

  return engrainPriceData;
};

const buildEngrainPrice = (amount: number, minAmount: number, maxAmount: number) => {
  if (minAmount && maxAmount) {
    const min = minAmount + amount;
    const max = maxAmount + amount;

    return `${min} - ${max}`;
  }

  return amount ? Number(amount) : 0;
};

export { getEngrainData };
