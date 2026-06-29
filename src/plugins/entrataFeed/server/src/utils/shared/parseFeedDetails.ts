import { buildBedFilterLabels, getBedFilter } from './bedFilter';

const pick = (item: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]]));

const getUnitIdsByFloorplanId = (floorplans: any[]) =>
  Object.fromEntries(
    floorplans.map((fp) => [
      fp.floorplan_id,
      (fp.units ?? []).map((unit: { unitId: number }) => unit.unitId),
    ]),
  );

const buildUnitsList = (
  entry: { floorplans?: { floorplan_id: number }[]; units?: { unitId: number }[] },
  unitIdsByFloorplanId: Record<number, number[]>,
) => {
  const fromFloorplans = (entry.floorplans ?? []).flatMap(
    (fp) => unitIdsByFloorplanId[fp.floorplan_id] ?? [],
  );
  const fromUnits = (entry.units ?? []).map((unit) => unit.unitId);

  return [...new Set([...fromFloorplans, ...fromUnits])].map((unitId) => ({ unitId }));
};

const parseAmenity = (entry: any, unitIdsByFloorplanId: Record<number, number[]>) => ({
  floorLevel: entry.floorLevel,
  amenitiesList: (entry.amenitiesList ?? []).map((item: Record<string, unknown>) =>
    pick(item, ['list']),
  ),
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  unitsList: buildUnitsList(entry, unitIdsByFloorplanId),
});

const parseVirtualTour = (entry: any, unitIdsByFloorplanId: Record<number, number[]>) => ({
  virtualTourLink: entry.virtualTourLink,
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  units: (entry.units ?? []).map((unit: Record<string, unknown>) => pick(unit, ['unitId'])),
  unitsList: buildUnitsList(entry, unitIdsByFloorplanId),
});

const parseSpecial = (entry: any) => ({
  ...pick(entry, ['special_id', 'special_type', 'floorplanTypes', 'isOverRide']),
  floorplans: (entry.floorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  units: (entry.units ?? []).map((unit: Record<string, unknown>) => pick(unit, ['unitId'])),
  customFloorplans: (entry.customFloorplans ?? []).map((fp: Record<string, unknown>) =>
    pick(fp, ['floorplan_id']),
  ),
  specials: entry.specials
    ? {
        ...pick(entry.specials, [
          'specialTitle',
          'specialDescription',
          'isOverRide',
          'showSpecials',
          'overRideText',
          'overRideDescription',
        ]),
        links: (entry.specials.links ?? []).map((link: Record<string, unknown>) =>
          pick(link, ['text', 'href', 'target']),
        ),
      }
    : null,
});
const parseSpecialDetails = (special: Record<string, unknown> | null | undefined) => {
  if (!special) {
    return null;
  }

  return {
    ...pick(special, [
      'specialTitle',
      'specialDescription',
      'isOverRide',
      'showSpecials',
      'overRideText',
      'overRideDescription',
    ]),
    links: ((special.links as Record<string, unknown>[]) ?? []).map((link) =>
      pick(link, ['text', 'href', 'target']),
    ),
  };
};

const parsePropertySetting = (entry: Record<string, unknown>) => {
  const topSpecial = Array.isArray(entry.topSpecial)
    ? entry.topSpecial
    : entry.topSpecial
      ? [entry.topSpecial]
      : [];

  return {
    topSpecial: topSpecial
      .map((special) => parseSpecialDetails(special as Record<string, unknown>))
      .filter(Boolean),
    popupSpecial: parseSpecialDetails(entry.popupSpecial as Record<string, unknown> | undefined),
  };
};
const getPropertyFilters = (floorplans: any[]) => {
  const result = floorplans.reduce(
    (acc, item) => ({
      maxRent: Math.max(acc.maxRent, item.minRent),
      minRent: Math.min(acc.minRent, item.minRent),
      maxSqft: Math.max(acc.maxSqft, item.minSqFt),
      minSqft: Math.min(acc.minSqft, item.minSqFt),
    }),
    {
      maxRent: -Infinity,
      minRent: Infinity,
      maxSqft: -Infinity,
      minSqft: Infinity,
    },
  );
  const { minRent, maxRent, minSqft, maxSqft } = result;
  return { minRent, maxRent, minSqft, maxSqft };
 
};

const parseFeedDetail = (
  entry?: Record<string, any>,
  floorplans: any[] = [],
) => {
  const bounds = floorplans.length > 0 ? getPropertyFilters(floorplans) : null;
  const bedFilter = floorplans.length > 0 ? getBedFilter(floorplans) : [];

  return {
    enableEngrainPricing: entry?.enableEngrainPricing,
    engrainPrice: entry?.engrainPrice,
    priceIncrement: entry?.priceIncrement ?? 1000,
    sqftIncrement: entry?.sqftIncrement ?? 500,
    ...(bounds ?? {}),
    ...(bedFilter.length > 0
      ? {
          bedFilter,
          bedFilterLabels: buildBedFilterLabels(bedFilter),
        }
      : {}),
  };
};

const parseFeedDetails = (
  {
    specials,
    amenities,
    virtualTours,
    feedDetails,
    propertySetting,
  }: {
    specials?: unknown;
    amenities?: unknown;
    virtualTours?: unknown;
    feedDetails?: unknown;
    propertySetting?: unknown;
  },
  floorplans: any[] = [],
) => {
  const unitIdsByFloorplanId = getUnitIdsByFloorplanId(floorplans);

  return {
    specials: Array.isArray(specials) ? specials.map(parseSpecial) : [],
    amenities: Array.isArray(amenities)
      ? amenities.map((entry) => parseAmenity(entry, unitIdsByFloorplanId))
      : [],
    virtualTours: Array.isArray(virtualTours)
      ? virtualTours.map((entry) => parseVirtualTour(entry, unitIdsByFloorplanId))
      : [],
    propertySpecifications: parseFeedDetail(
      feedDetails && typeof feedDetails === 'object'
        ? (feedDetails as Record<string, any>)
        : undefined,
      floorplans,
    ),
    propertySetting:
      propertySetting && typeof propertySetting === 'object' && !Array.isArray(propertySetting)
        ? parsePropertySetting(propertySetting as Record<string, unknown>)
        : null,
  };
};
export default parseFeedDetails;
