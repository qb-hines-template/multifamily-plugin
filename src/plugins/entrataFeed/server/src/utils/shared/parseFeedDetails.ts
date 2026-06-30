import pick from '../../shared/pick';

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
const parseFeedDetails = (
  {
    specials,
    amenities,
    virtualTours,
    propertySetting,
  }: {
    specials?: unknown;
    amenities?: unknown;
    virtualTours?: unknown;
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
    propertySetting:
      propertySetting && typeof propertySetting === 'object' && !Array.isArray(propertySetting)
        ? parsePropertySetting(propertySetting as Record<string, unknown>)
        : null,
  };
};
export default parseFeedDetails;
