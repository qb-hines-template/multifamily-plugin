export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/engrain-pricing/updateEngrainPrice',
      handler: 'engrainCalculatorController.updateEngrainPrice',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/floorplans/sync-s3',
      handler: 'floorplanController.syncFeed',
      config: {
        policies: [],
      },
    },
  ],
});
