export default {
  async find(ctx) {
    ctx.body = await strapi.plugin('entratafeed').service('special').getPropertySetting();
  },
};
