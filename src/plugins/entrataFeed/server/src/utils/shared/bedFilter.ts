const PENTHOUSE_NAME = 'Penthouse';

type FloorplanBedSource = {
  bed_count?: number | string;
  floorplan_name?: string;
};

type FloorplanTypeRecord = {
  name: string;
  description: string;
  bedCount?: number | null;
};

const isPenthouseFloorplan = (floorplan: FloorplanBedSource) => {
  const name = floorplan.floorplan_name?.trim().toLowerCase();

  return name ? name.includes('ph') : false;
};

const hasPenthouseFloorplans = (floorplans: FloorplanBedSource[]) =>
  floorplans.some(isPenthouseFloorplan);

const getBedFilter = (floorplans: FloorplanBedSource[]) =>
  [
    ...new Set(
      floorplans
        .map((item) => Number(item.bed_count))
        .filter((count) => Number.isFinite(count)),
    ),
  ].sort((a, b) => a - b);

const getBedLabel = (count: number) => (count === 0 ? 'Studio' : `${count} Bed`);

const buildBedFilterLabels = (bedFilter: number[]) => bedFilter.map((count) => getBedLabel(count));

const buildFloorplanTypeRecords = (floorplans: FloorplanBedSource[]): FloorplanTypeRecord[] => {
  const bedTypes = getBedFilter(floorplans).map((bedCount) => ({
    bedCount,
    name: getBedLabel(bedCount),
    description: getBedLabel(bedCount),
  }));

  if (!hasPenthouseFloorplans(floorplans)) {
    return bedTypes;
  }

  return [
    ...bedTypes,
    {
      name: PENTHOUSE_NAME,
      description: PENTHOUSE_NAME,
      bedCount: null,
    },
  ];
};

export {
  PENTHOUSE_NAME,
  getBedFilter,
  getBedLabel,
  buildBedFilterLabels,
  buildFloorplanTypeRecords,
  hasPenthouseFloorplans,
};
