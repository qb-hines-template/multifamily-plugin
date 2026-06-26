export default () => ({
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/property-setting",
      handler: "propertySettingController.find",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/property-setting",
      handler: "propertySettingController.update",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/engrain-pricing/updateEngrainPrice",
      handler: "engrainCalculatorController.updateEngrainPrice",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/floorplans/sync-s3",
      handler: "floorplanController.syncFeed",
      config: {
        policies: [],
      },
    },
  ],
});
