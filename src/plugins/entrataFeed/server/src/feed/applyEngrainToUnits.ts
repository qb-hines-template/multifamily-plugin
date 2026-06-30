import { addEngrainToUnitPrice, parseEngrainRange } from '../shared/parsePrice';
import type { FloorplanWithUnits, FloorPlanConfig } from '../types/feed';

/**
 * Adds `engrainPrice` to every unit when engrain pricing is enabled.
 * Skips units when pricing is disabled or no engrain amount is configured.
 */
const applyEngrainToUnits = (
  floorplans: FloorplanWithUnits[],
  config: FloorPlanConfig,
) => {
  if (!config?.enableEngrainPricing || !config.engrainPrice) {
    return floorplans;
  }

  const engrainRange = parseEngrainRange(config.engrainPrice);

  for (const floorplan of floorplans) {
    for (const unit of floorplan.units ?? []) {
      unit.engrainPrice = addEngrainToUnitPrice(unit.best_price, engrainRange);
    }
  }

  return floorplans;
};

export default applyEngrainToUnits;
