type ParsedFloorplan = Record<string, unknown> & {
  floorplan_id: number | string;
};

type ParsedUnit = {
  floorplan_id: number | string;
  best_price?: number | string;
  availability_date?: string | null;
};

const toStrapiDate = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const normalized = date.replace(/\//g, '-');

  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
};

const toAvailabilityTimestamp = (date?: string | null) => {
  const strapiDate = toStrapiDate(date);

  if (!strapiDate) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(strapiDate).getTime();

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const buildFloorplansWithUnits = (
  floorplans: { data: Record<string, unknown> }[],
  mitsUnits: {
    floorplanId: number | string;
    availability_url?: string;
    floorplan_image?: string;
  }[],
  units: ParsedUnit[]
) => {
  const mitsByFloorplanId = new Map(mitsUnits.map((u) => [u.floorplanId, u]));

  const floorplanData = floorplans.map((item): ParsedFloorplan => {
    const floorplanId = item.data.floorplan_id as number | string;
    const mits = mitsByFloorplanId.get(floorplanId);

    return {
      ...item.data,
      floorplan_id: floorplanId,
      ...(mits
        ? {
            availability_url: mits.availability_url,
            floorplan_image: mits.floorplan_image,
          }
        : {}),
    };
  });

  const unitsByFloorplan = new Map<number | string, ParsedUnit[]>();

  for (const unit of units) {
    if (!unitsByFloorplan.has(unit.floorplan_id)) {
      unitsByFloorplan.set(unit.floorplan_id, []);
    }

    unitsByFloorplan.get(unit.floorplan_id)!.push(unit);
  }

  return floorplanData.map((fp) => {
    const relatedUnits = unitsByFloorplan.get(fp.floorplan_id) || [];
  
    const prices = relatedUnits
      .map((u) => Number(u.best_price))
      .filter((p) => p > 0);
  
    const earliestUnit =
      relatedUnits.length > 0
        ? relatedUnits.reduce((min, current) =>
            toAvailabilityTimestamp(current.availability_date) <
            toAvailabilityTimestamp(min.availability_date)
              ? current
              : min
          )
        : null;
  
    return {
      ...fp,
      available_min_rent: prices.length > 0 ? Math.min(...prices) : 0,
      min_availability_date: toStrapiDate(earliestUnit?.availability_date),
      units: relatedUnits,
    };
  });
};

export default buildFloorplansWithUnits;
