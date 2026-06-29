import type { Core } from '@strapi/strapi';
import type { Modules } from '@strapi/types';

import { FLOORPLAN_UID, UNIT_UID } from '../../constants/api-constants';
import syncFloorplanTypes from './syncFloorplanTypes';

type UnitInput = Modules.Documents.Params.Data.Input<typeof UNIT_UID> & {
  floorplan?: { documentId: string };
};

const normalizeId = (id: number | string | null | undefined) =>
  id == null ? undefined : Number(id);

const buildUnitData = (unit: Record<string, unknown>, floorplanDocumentId?: string): UnitInput => {
  const { floorplan: _floorplan, ...unitFields } = unit;

  return {
    ...(unitFields as UnitInput),
    ...(floorplanDocumentId ? { floorplan: { documentId: floorplanDocumentId } } : {}),
  };
};

const syncToStrapi = async (
  strapi: Core.Strapi,
  floorplansWithUnits: Record<string, unknown>[],
) => {
  const finalFloorplans = floorplansWithUnits.map(({ units: _units, ...rest }) => rest);
  const units = floorplansWithUnits.flatMap((fp) => (fp.units as Record<string, unknown>[]) ?? []);

  const [existingFloorplans, propertyUnits] = await Promise.all([
    strapi.documents(FLOORPLAN_UID).findMany({
      filters: {
        floorplan_id: {
          $in: finalFloorplans.map((fp) => fp.floorplan_id),
        },
      },
      fields: ['floorplan_id','documentId'],
      status: 'published',
    }),
    strapi.documents(UNIT_UID).findMany({
      filters: {
        unitId: {
          $in: units.map((u) => u.unitId),
        },
      },
      fields: ['unitId', 'documentId', 'floorplan_id'],
      populate: {
        floorplan: {
          fields: ['documentId'],
        },
      },
      status: 'published',
    }),
  ]);

  const floorplanDocIds = new Map<number, string>(
    existingFloorplans.flatMap((fp) => {
      const floorplanId = normalizeId(fp.floorplan_id as number | string);

      return floorplanId == null ? [] : [[floorplanId, fp.documentId] as const];
    }),
  );

  await Promise.all(
    finalFloorplans.map(async (fp) => {
      const floorplanId = normalizeId(fp.floorplan_id as number | string);

      if (floorplanId == null) {
        return;
      }

      const documentId = floorplanDocIds.get(floorplanId);

      const result = documentId
        ? await strapi.documents(FLOORPLAN_UID).update({
            documentId,
            data: fp,
            status: 'published',
          })
        : await strapi.documents(FLOORPLAN_UID).create({
            data: fp,
            status: 'published',
          });

      floorplanDocIds.set(floorplanId, result.documentId);
    }),
  );

  await syncFloorplanTypes(strapi, finalFloorplans);

  const unitDocIds = new Map(propertyUnits.map((u) => [u.unitId, u.documentId]));

  await Promise.all(
    units.map((u) => {
      const documentId = unitDocIds.get(u.unitId as number);
      const floorplanId = normalizeId(u.floorplan_id as number | string);
      const floorplanDocumentId =
        floorplanId == null ? undefined : floorplanDocIds.get(floorplanId);
      const data = buildUnitData(u, floorplanDocumentId);

      if (documentId) {
        return strapi.documents(UNIT_UID).update({
          documentId,
          data,
          status: 'published',
        });
      }

      return strapi.documents(UNIT_UID).create({
        data,
        status: 'published',
      });
    }),
  );
};

export default syncToStrapi;
