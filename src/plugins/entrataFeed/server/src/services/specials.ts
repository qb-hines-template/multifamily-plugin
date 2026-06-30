import { findPropertySetting } from '../utils/propertySettingDocument';

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
};
