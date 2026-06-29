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

const parseEngrainRange = (value: unknown) => {
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

const addEngrainToUnitPrice = (bestPrice: unknown, engrain: { min: number; max: number }) => {
  const base = parsePrice(bestPrice);
  const min = base + engrain.min;
  const max = base + engrain.max;

  return min === max ? min : `${min}-${max}`;
};

export { addEngrainToUnitPrice, parseEngrainRange, parsePrice };
