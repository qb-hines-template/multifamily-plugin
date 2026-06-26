import {
  findPropertySetting,
  publishPropertySetting,
  saveAndPublishPropertySetting,
  savePropertySettingDraft,
} from "../utils/propertySettingDocument";

export default {
  async getPropertySetting() {
    const setting = await findPropertySetting(strapi);

    return (
      setting || {
        topSpecial: [],
        popupSpecial: null,
      }
    );
  },

  async updatePropertySetting(
    data: Record<string, unknown>,
    options: { publish?: boolean } = {}
  ) {
    if (options.publish) {
      return saveAndPublishPropertySetting(strapi, data);
    }

    return savePropertySettingDraft(strapi, data);
  },

  async publishPropertySetting() {
    return publishPropertySetting(strapi);
  },
};
