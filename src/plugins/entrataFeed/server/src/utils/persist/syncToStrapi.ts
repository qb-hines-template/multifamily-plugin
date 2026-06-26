import type { Core } from '@strapi/strapi';

import { FLOORPLAN_UID, UNIT_UID } from '../../constants/api-constants';

const syncToStrapi = async (
  strapi: Core.Strapi,
  floorplansWithUnits: Record<string, unknown>[],
) => {
  const finalFloorplans = floorplansWithUnits.map(({ units: _units, ...rest }) => rest);
  const units = floorplansWithUnits.flatMap((fp) => (fp.units as Record<string, unknown>[]) ?? []);

  const existingFloorplans = await strapi.documents(FLOORPLAN_UID).findMany({
    filters: {
      floorplan_id: {
        $in: finalFloorplans.map((fp) => fp.floorplan_id),
      },
    },
    status: 'published',
  });

  const floorplanDocIds = new Map(
    existingFloorplans.map((fp) => [fp.floorplan_id, fp.documentId]),
  );

  await Promise.all(
    finalFloorplans.map((fp) => {
      const documentId = floorplanDocIds.get(fp.floorplan_id as number | string);

      if (documentId) {
        return strapi.documents(FLOORPLAN_UID).update({
          documentId,
          data: fp,
          status: 'published',
        });
      }

      return strapi.documents(FLOORPLAN_UID).create({
        data: fp,
        status: 'published',
      });
    }),
  );

  const propertyUnits = await strapi.documents(UNIT_UID).findMany({
    filters: {
      unitId: {
        $in: units.map((u) => u.unitId),
      },
    },
    status: 'published',
  });

  const unitDocIds = new Map(propertyUnits.map((u) => [u.unitId, u.documentId]));

  await Promise.all(
    units.map((u) => {
      const documentId = unitDocIds.get(u.unitId as number);

      if (documentId) {
        return strapi.documents(UNIT_UID).update({
          documentId,
          data: u,
          status: 'published',
        });
      }

      return strapi.documents(UNIT_UID).create({
        data: u,
        status: 'published',
      });
    }),
  );
};

export default syncToStrapi;
