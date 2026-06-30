import { FLOOR_PLAN_CONFIGURATION_UID } from '../constants/api-constants';
import { fetchWithTimeout } from '../shared/fetchWithTimeout';
import type { EngrainPriceRange } from '../types/engrain';

type EngrainExpense = {
  is_required?: boolean;
  is_enabled?: boolean;
  frequency?: string;
  value_type?: string;
  amount?: string | number;
  min_amount?: string | number;
  max_amount?: string | number;
};

/**
 * Calls the Sightmap/Engrain expenses API and returns the raw expense list.
 */
const fetchEngrainExpenses = async () => {
  const apiUrl = process.env.ENGRAIN_API_URL;

  if (!apiUrl) {
    throw new Error('ENGRAIN_API_URL is not configured');
  }

  if (!process.env.ENGRAIN_API_KEY) {
    throw new Error('ENGRAIN_API_KEY is not configured');
  }

  const response = await fetchWithTimeout(apiUrl, {
    headers: {
      'API-Key': process.env.ENGRAIN_API_KEY,
      'Experimental-Flags': process.env.EXPERIMENTAL_FLAGS ?? '',
    },
  });

  if (!response.ok) {
    throw new Error(`Engrain API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { data?: EngrainExpense[] };

  return Array.isArray(payload.data) ? payload.data : [];
};

/**
 * Sums required monthly Engrain expenses into a min/max monthly total.
 */
const calculateEngrainPriceRange = (expenses: EngrainExpense[]): EngrainPriceRange => {
  let amount = 0;
  let minAmount = 0;
  let maxAmount = 0;

  for (const expense of expenses) {
    const isMonthlyExpense =
      expense.is_required &&
      expense.is_enabled &&
      expense.frequency === 'monthly' &&
      expense.value_type !== 'text';

    if (!isMonthlyExpense) {
      continue;
    }

    if (expense.value_type === 'amount') {
      amount += parseFloat(String(expense.amount)) || 0;
    }

    if (expense.value_type === 'range') {
      minAmount += parseFloat(String(expense.min_amount)) || 0;
      maxAmount += parseFloat(String(expense.max_amount)) || 0;
    }
  }

  return {
    min: amount + minAmount,
    max: amount + maxAmount,
  };
};

/**
 * Formats the calculated range for storage on floor-plan-configuration.
 */
const formatEngrainPriceForDb = ({ min, max }: EngrainPriceRange) =>
  min === max ? `${min}` : `${min}-${max}`;

/**
 * Persists the latest engrain price and returns the populated configuration document.
 */
const persistEngrainConfig = async (documentId: string, priceRange: EngrainPriceRange) => {
  return strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).update({
    documentId,
    data: {
      engrainPrice: formatEngrainPriceForDb(priceRange),
    } as never,
    status: 'published',
    populate: ['floorplanCard', 'floorplanFilters'],
    fields: [
      'engrainPrice',
      'enableEngrainPricing',
      'engrainPriceLabel',
      'sortOrder',
      'priceIncrement',
      'sqftIncrement',
    ],
  });
};

/**
 * Fetches Engrain pricing, saves it to Strapi, and returns the updated config document.
 */
const syncEngrainFromApi = async (documentId: string) => {
  const expenses = await fetchEngrainExpenses();
  const priceRange = calculateEngrainPriceRange(expenses);
  const config = await persistEngrainConfig(documentId, priceRange);

  return { config, priceRange };
};

export {
  calculateEngrainPriceRange,
  fetchEngrainExpenses,
  formatEngrainPriceForDb,
  persistEngrainConfig,
  syncEngrainFromApi,
};
