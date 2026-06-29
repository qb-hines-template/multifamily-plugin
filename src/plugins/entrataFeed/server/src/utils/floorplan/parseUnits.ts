import { parsePrice } from '../shared/parsePrice';

const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const formatDate = (date?: string) => {
  if (!date) return null;

  const [month, day, year] = date.split('/');

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const unitsProperty = async (propertySettingsApi: any, parsedUnits: any[]) => {
  const property = propertySettingsApi?.response?.result?.properties?.property;
  const propertyEntry = asArray(property)[0];

  const unitEntries = asArray(propertyEntry?.units?.unit);

  // Match by unitId + floorPlanId
  const unitMap = new Map(unitEntries.map((unit) => [`${unit.id}-${unit.floorPlanId}`, unit]));

  const units = parsedUnits.flatMap((parsedUnit) => {
    const sourceUnit = unitMap.get(`${parsedUnit.unitId}-${parsedUnit.floorplan_id}`);

    if (!sourceUnit) return [];

    const unitSpaces = asArray(sourceUnit.unitSpaces?.unitSpace);

    return unitSpaces.map((unitSpace) => {
      const rentAttributes = unitSpace.rent || {};
      const termRent = asArray(rentAttributes.termRent);
      const bestPriceTerm = termRent.find((term) => term.isBestPrice === '1');

      const bestPrice = bestPriceTerm ? bestPriceTerm.rent : 0;

      return {
        unitId: Number(sourceUnit.id),
        unit_space_id: Number(unitSpace.unitSpaceId),
        unit_number: unitSpace.unitNumber,
        is_web_visible: parsedUnit.is_web_visible,
        floorplan_id: Number(sourceUnit.floorPlanId),
        floorplan_name: sourceUnit.floorplanName,
        floor_number: Number(sourceUnit.floorNumber),
        apartment_id: Number(sourceUnit.buildingId),
        availabilityStatus: unitSpace.availabilityStatus,
        availability_date: formatDate(unitSpace.availableDate),
        sqft: Number(sourceUnit.SquareFeet),
        deposit: Number(unitSpace.minDeposit || 0),
        has_pricing: Number(unitSpace.hasPricing || 0),
        best_price: parsePrice(bestPrice),
        occupancy_type: unitSpace.occupancyTypeName ?? null,
        unit_status: unitSpace.availabilityStatus ?? null,
        availability_url: unitSpace.unitAvailabilityURL ?? null,
        term_rents: { term_rents: termRent },
        sort_order: Number(sourceUnit.numberOfBedrooms || 0),
      };
    });
  });

  return units;
};

export default unitsProperty;
