import slugify from "slugify";

const syncCollectionSpecial = async (strapi, specials) => {
  for (const item of specials) {
    const associatedType = slugify(String(item.associations), {
      lower: true,
    });

    if (!["space", "floor-plan", "unit-type"].includes(associatedType)) {
      continue;
    }


    let specialType;
    let relationField;
    let relationDocumentIds = [];
    let floorplanTypes = [];

    if (associatedType === "space") {
      const unitIds = item.association_references.map((ref) => ref.id);

      const units = await strapi
        .documents("plugin::entratafeed.unit")
        .findMany({
          filters: {
            unit_space_id: {
              $in: unitIds,
            },
          },
          status: "published",
        });

      relationDocumentIds = units.map((unit) => unit.documentId);
      specialType = "unit";
      relationField = "units";
    }

    if (associatedType === "floor-plan") {
      const floorplanIds = item.association_references.map((ref) => ref.id);

      const floorplans = await strapi
        .documents("plugin::entratafeed.floorplan")
        .findMany({
          filters: {
            floorplan_id: {
              $in: floorplanIds,
            },
          },
          status: "published",
        });

      relationDocumentIds = floorplans.map(
        (floorplan) => floorplan.documentId,
      );

      specialType = "floorplan";
      relationField = "floorplans";
    }

    if (associatedType === "unit-type") {
      floorplanTypes = item.association_references;
      specialType = "floorplanType";
    }

    const existingSpecial = await strapi
      .documents("plugin::entratafeed.special")
      .findFirst({
        filters: {
          special_id: item.special_id,
        },
        populate: ["specials", "customFloorplans"],
        status: "published",
      });

    const specialData = {
      special_id: item.special_id,
      special_type: specialType,
      [relationField]: relationDocumentIds,
      floorplanTypes,
      customFloorplans: existingSpecial?.customFloorplans || [],
      isOverRide: existingSpecial?.isOverRide || false,
      specials: {
        specialTitle: item.special_name,
        specialDescription: item.description,
        isOverRide: existingSpecial?.specials?.isOverRide || false,
        overRideText: existingSpecial?.specials?.overRideText || "",
        overRideDescription:
          existingSpecial?.specials?.overRideDescription || "",
      },
    };

    if (existingSpecial) {
      await strapi.documents("plugin::entratafeed.special").update({
        documentId: existingSpecial.documentId,
        data: specialData,
        status: "published",
      });
    } else {
      await strapi.documents("plugin::entratafeed.special").create({
        data: specialData,
        status: "published",
      });
    }
  }
};

export default syncCollectionSpecial;
