type ControllerError = {
  status?: number;
  message?: string;
  details?: unknown;
};

const handlePropertySettingError = (
  ctx: { status: number; body: unknown },
  label: string,
  error: unknown
) => {
  const err = error as ControllerError;
  strapi.log.error(`${label} failed`, error);
  ctx.status = err.status || 400;
  ctx.body = {
    error: err.message || `${label} failed`,
    details: err.details,
  };
};

export default {
  async find(ctx) {
    ctx.body = await strapi.plugin('entratafeed').service('special').getPropertySetting();
  },

  async update(ctx) {
    try {
      const body = ctx.request.body as Record<string, unknown>;
      const shouldPublish = body.publish === true;
      const { publish: _publish, ...data } = body;

      ctx.body = await strapi
        .plugin('entratafeed')
        .service('special')
        .updatePropertySetting(data, { publish: shouldPublish });
    } catch (error) {
      handlePropertySettingError(ctx, 'property-setting update', error);
    }
  },

  async publish(ctx) {
    try {
      const body = ctx.request.body as Record<string, unknown> | undefined;
      const service = strapi.plugin('entratafeed').service('special');

      if (body && Object.keys(body).length > 0) {
        const { publish: _publish, ...data } = body;
        ctx.body = await service.updatePropertySetting(data, { publish: true });
      } else {
        ctx.body = await service.publishPropertySetting();
      }
    } catch (error) {
      handlePropertySettingError(ctx, 'property-setting publish', error);
    }
  },
};
