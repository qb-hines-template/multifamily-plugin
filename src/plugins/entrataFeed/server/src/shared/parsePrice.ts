import type { EngrainAmountRange } from '../types/engrain';

/**
 * Converts a price value from Entrata or Strapi into a number.
 * Handles plain numbers, currency strings (`$1,500`), and comma-separated values.
 */
const parsePrice = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const match = String(value ?? '').match(/(\d[\d,]*\.?\d*)/);

  if (!match) {
    return 0;
  }

  const price = parseFloat(match[1].replace(/,/g, ''));

  return Number.isFinite(price) ? price : 0;
};

/**
 * Parses an engrain price stored in Strapi as either a single value or a range.
 * Examples: `"120"`, `"120-225"`, `"120 - 225"`
 */
const parseEngrainRange = (value: unknown): EngrainAmountRange => {
  const str = String(value ?? '').trim();
  const rangeMatch = str.match(/^([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)$/);

  if (rangeMatch) {
    return {
      min: parsePrice(rangeMatch[1]),
      max: parsePrice(rangeMatch[2]),
    };
  }

  const amount = parsePrice(value);

  return { min: amount, max: amount };
};

/**
 * Adds engrain expenses to a unit's best price.
 * Returns a number for fixed pricing or a `"min-max"` string for ranges.
 */
const addEngrainToUnitPrice = (bestPrice: unknown, engrain: EngrainAmountRange) => {
  const base = parsePrice(bestPrice);
  const min = base + engrain.min;
  const max = base + engrain.max;

  return min === max ? min : `${min}-${max}`;
};

export { addEngrainToUnitPrice, parseEngrainRange, parsePrice };
