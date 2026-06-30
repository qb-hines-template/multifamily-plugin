/** Calculated min/max monthly expense totals from the Engrain API. */
export type EngrainPriceRange = {
  min: number;
  max: number;
};

/** Parsed engrain amount used when adding pricing to each unit. */
export type EngrainAmountRange = {
  min: number;
  max: number;
};
