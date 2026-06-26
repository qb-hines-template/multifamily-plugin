export default {
  async updateEngrainPrice(ctx) {
    try {
      ctx.body = await strapi
        .plugin('entratafeed')
        .service('engrainCalculator')
        .updateEngrainPrice(ctx.request.body as Record<string, unknown>);
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        error: {
          message: error instanceof Error ? error.message : 'Failed to sync Engrain price',
        },
      };
    }
  },
};
