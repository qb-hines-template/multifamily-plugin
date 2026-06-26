const ENTRATA_PROPERTY_ID = Number(process.env.ENTRATA_PROPERTY_ID || 100124923);
const entrataUrl = process.env.ENTRATA_URL;
const entrataApiKey = process.env.ENTRATA_API_KEY;

const DEFAULT_UNIT_PARAMS = {
  includeDisabledFloorplans: '1',
  includeDisabledUnits: '1',
  showUnitSpaces: '1',
  useSpaceConfiguration: '1',
};

export { ENTRATA_PROPERTY_ID, entrataUrl, entrataApiKey, DEFAULT_UNIT_PARAMS };
