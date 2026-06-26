import type { Core } from "@strapi/strapi";

const PROPERTY_SETTING_UID = "plugin::entratafeed.property-setting";

const populate = { topSpecial: true, popupSpecial: true } as const;

const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const stripComponentMetadata = (
  item: Record<string, unknown> | null | undefined
) => {
  if (!item) {
    return null;
  }

  const {
    id: _id,
    documentId: _documentId,
    __component: _component,
    ...fields
  } = item;

  return fields;
};

const prepareData = (data: Record<string, unknown>): Record<string, unknown> => ({
  ...data,
  topSpecial: asArray(data.topSpecial).map((item) =>
    stripComponentMetadata(item as Record<string, unknown>)
  ),
  popupSpecial: stripComponentMetadata(
    data.popupSpecial as Record<string, unknown> | undefined
  ),
});

const findDocumentId = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(PROPERTY_SETTING_UID).findFirst({
    status: "draft",
  });

  if (draft) {
    return draft.documentId;
  }

  return (
    await strapi.documents(PROPERTY_SETTING_UID).findFirst({
      status: "published",
    })
  )?.documentId;
};

/** Load draft for editing; fall back to published when no draft exists. */
export const findPropertySetting = async (strapi: Core.Strapi) => {
  const draft = await strapi.documents(PROPERTY_SETTING_UID).findFirst({
    status: "draft",
    populate,
  });

  if (draft) {
    return draft;
  }

  return strapi.documents(PROPERTY_SETTING_UID).findFirst({
    status: "published",
    populate,
  });
};

/** Save changes to draft only (same as Content Manager save). */
export const savePropertySettingDraft = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>
) => {
  const payload = prepareData(data);
  const documentId = await findDocumentId(strapi);

  if (documentId) {
    return strapi.documents(PROPERTY_SETTING_UID).update({
      documentId,
      data: payload as never,
      status: "draft",
    });
  }

  return strapi.documents(PROPERTY_SETTING_UID).create({
    data: payload,
    status: "draft",
  });
};

/** Publish the current draft to the live version. */
export const publishPropertySetting = async (strapi: Core.Strapi) => {
  const documentId = await findDocumentId(strapi);

  if (!documentId) {
    throw new Error("No property setting document to publish");
  }

  return strapi.documents(PROPERTY_SETTING_UID).publish({ documentId });
};

/** Used by Entrata sync: save draft, then publish immediately. */
export const saveAndPublishPropertySetting = async (
  strapi: Core.Strapi,
  data: Record<string, unknown>
) => {
  await savePropertySettingDraft(strapi, data);

  return publishPropertySetting(strapi);
};
