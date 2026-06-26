import externalApi from '../shared/externalApi';
import floorplanUnits from '../floorplan/parseFp';
import mitsPropertyUnit from '../floorplan/parseMits';
import unitsProperty from '../floorplan/parseUnits';
import buildFloorplansWithUnits from '../floorplan/buildFloorplansWithUnits';
import {
  ENTRATA_PROPERTY_ID,
  entrataUrl,
  entrataApiKey,
  DEFAULT_UNIT_PARAMS,
} from './config';

type FetchEntrataFeedOptions = {
  moveInDate?: string;
};

const fetchEntrataFeed = async (options: FetchEntrataFeedOptions = {}) => {
  const unitParams = {
    propertyId: ENTRATA_PROPERTY_ID,
    ...DEFAULT_UNIT_PARAMS,
    ...(options.moveInDate ? { preferredMoveInDate: options.moveInDate } : {}),
    
  };

  const [availability, property, mits] = await Promise.all([
    externalApi(
      'getUnitsAvailabilityAndPricing',
      unitParams,
      entrataUrl,
      entrataApiKey,
      'r1',
    ),
    externalApi(
      'getPropertyUnits',
      { propertyIds: ENTRATA_PROPERTY_ID, ...DEFAULT_UNIT_PARAMS },
      entrataUrl,
      entrataApiKey,
      'r1',
    ),
    externalApi(
      'getMitsPropertyUnits',
      { propertyIds: ENTRATA_PROPERTY_ID, ...DEFAULT_UNIT_PARAMS },
      entrataUrl,
      entrataApiKey,
      'r1',
    ),
  ]);

  const { parsedFp, parsedUnits } = await floorplanUnits(availability);

  const [units, mitsUnits] = await Promise.all([
    unitsProperty(property, parsedUnits),
    mitsPropertyUnit(mits),
  ]);

  return buildFloorplansWithUnits(
    parsedFp.flat(),
    mitsUnits.flat(),
    units.flat(),
  );
};

const fetchEntrataSpecials = () =>
  externalApi(
    'getSpecials',
    { propertyId: ENTRATA_PROPERTY_ID },
    entrataUrl,
    entrataApiKey,
    'r4',
  );

export { fetchEntrataFeed, fetchEntrataSpecials };
