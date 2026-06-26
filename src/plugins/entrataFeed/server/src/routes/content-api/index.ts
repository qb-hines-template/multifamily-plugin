const bearerAuthConfig = {
  auth: false,
  policies: ["plugin::entratafeed.is-bearer-authenticated"],
};

export default () => ({
  type: "content-api",
  routes: [
  {
      method: "GET",
      path: "/specials/feed",
      handler: "propertySettingController.find",
      config: bearerAuthConfig,
    },
    {
      method: "POST",
      path: "/floorplans/generate",
      handler: "floorplanController.generate",
      config: bearerAuthConfig,
    },
    {
      method: "POST",
      path: "/engrain-pricing/updateEngrainPrice",
      handler: "engrainCalculatorController.updateEngrainPrice",
      config: bearerAuthConfig,
    },
    {
      method: "GET",
      path: "/floorplans/feed",
      handler: "floorplanController.getFeed",
    },
    {
      method: "GET",
      path: "/floorplans/feed/syncFeed",
      handler: "floorplanController.syncFeed",
    },
  ],
});
