import { FLOOR_PLAN_CONFIGURATION_UID } from '../../constants/api-constants';

type EngrainPrice = {
  min: number;
  max: number;
};

const getEngrainData = async (documentId: string) => {
  const res = await fetch(process.env.ENGRAIN_API_URL, {
    headers: {
      'API-Key': process.env.ENGRAIN_API_KEY,
      'Experimental-Flags': process.env.EXPERIMENTAL_FLAGS,
    },
  });
  const response = (await res.json()) as { data?: unknown[] };

  const data = Array.isArray(response?.data) ? response.data : [];
  let amount = 0;
  let minAmount = 0;
  let maxAmount = 0;
  // Calculate the sum of 'amount.amount' fields that meet the filter conditions
  data.map((el: any) => {
    if (el.is_required && el.is_enabled && el.frequency === 'monthly' && el.value_type !== 'text') {
      if (el.value_type === 'amount') {
        amount = parseFloat(el.amount) + amount;
       
      }
      if (el.value_type === 'range') {
        minAmount = parseFloat(el.min_amount) + minAmount;
        maxAmount = parseFloat(el.max_amount) + maxAmount;
       
      }
    }
  });

  const engrainPriceData = buildEngrainPrice(amount, minAmount, maxAmount);

  const config = await pushToDb(documentId, engrainPriceData);

  return {
    config
  };
};

const buildEngrainPrice = (amount: number, minAmount: number, maxAmount: number): EngrainPrice => {
  return {
    min: amount + minAmount,
    max: amount + maxAmount,
  };
};

const pushToDb = async (documentId, engrainPriceData: EngrainPrice) => {
  const { min, max } = engrainPriceData;
  

  const configData =await strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).update({
    documentId,
    data: {
      engrainPrice: min === max ? `${min}` : `${min}-${max}`,
    } as never,
    status: 'published',
    populate: ['floorplanCard','floorplanFilters'],
    fields: ['engrainPrice','enableEngrainPricing','engrainPriceLabel','sortOrder'],
  });
  return configData;
};

export { getEngrainData };
