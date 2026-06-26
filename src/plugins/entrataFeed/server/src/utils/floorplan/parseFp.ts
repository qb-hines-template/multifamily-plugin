const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const parseUnits = (units: Record<string, unknown>[]) =>
  units.flatMap((unit) => {
    const unitDetails = (unit['@attributes'] || {}) as Record<string, unknown>;
    const unitSpaces = asArray(
      unit.UnitSpace as Record<string, unknown> | Record<string, unknown>[]
    );

    if (unitSpaces.length === 0) {
      return [];
    }

    return [
      {
        unitId: unitDetails.Id ? Number(unitDetails.Id) : null,
        floorplan_id: unitDetails.FloorplanId ? Number(unitDetails.FloorplanId) : null,
        is_web_visible: unitDetails.WebVisible,
      },
    ];
  });

const floorplanUnits = async (availabilitySettingsApi) => {
  const propertyUnits = asArray(
    availabilitySettingsApi?.response?.result?.PropertyUnits?.PropertyUnit
  );

  const unitTypeIds: Record<string | number, unknown> = {};

  propertyUnits.forEach((unit) => {
    const attr = (unit['@attributes'] || {}) as Record<string, unknown>;

    if (attr.FloorplanId && attr.UnitTypeId) {
      unitTypeIds[String(attr.FloorplanId)] = attr.UnitTypeId;
    }
  });

  const floorplans = asArray(
    availabilitySettingsApi?.response?.result?.Properties?.Property?.[0]?.Floorplans?.Floorplan
  );

  const parsedFp = floorplans.map((item) => {
    let bedrooms = 0;
    let bathrooms = 0;

    asArray(item.Room).forEach((room) => {
      const roomType = room['@attributes']?.RoomType;

      if (roomType === 'Bedroom') {
        bedrooms = room.Count || 0;
      }

      if (roomType === 'Bathroom') {
        bathrooms = room.Count || 0;
      }
    });

    const floorplanId = item.Identification?.IDValue || '';

    return {
      data: {
        floorplan_id: floorplanId,
        floorplan_name: item.Name || '',
        bed_count: bedrooms,
        bath_count: bathrooms,
        minSqFt: parseInt(item.SquareFeet?.['@attributes']?.Min || 0, 10),
        maxSqFt: parseInt(item.SquareFeet?.['@attributes']?.Max || 0, 10),
        minRent: parseFloat(item.MarketRent?.['@attributes']?.Min || 0) || 0,
        maxRent: parseFloat(item.MarketRent?.['@attributes']?.Max || 0) || 0,
        minDeposit: parseFloat(item.Deposit?.Amount?.ValueRange?.['@attributes']?.Min || 0) || 0,
        maxDeposit: parseFloat(item.Deposit?.Amount?.ValueRange?.['@attributes']?.Max || 0) || 0,
        available_unit_count: item.UnitsAvailable || 0,
        sort_order: item.Name?.toLowerCase().startsWith('ph') ? 99 : bedrooms,
        unit_type_mapping: '',
        availability_url: '',
        unit_type_id: unitTypeIds[String(floorplanId)] ?? null,
      },
    };
  });

  const parsedUnits = parseUnits(propertyUnits);

  return { parsedFp, parsedUnits };
};

export default floorplanUnits;
