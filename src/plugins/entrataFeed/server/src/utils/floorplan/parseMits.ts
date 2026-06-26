const mitsPropertyUnit = async (mitsSettingsApi) => {
  const mitsUnits = mitsSettingsApi.response.result.PhysicalProperty.Property[0].Floorplan.map(
    (item) => {
      return {
        availability_url: item.FloorplanAvailabilityURL,
        floorplan_image: item.File?.[0]?.Src || null,
        floorplanId: item.Identification.IDValue,
      };
    }
  );
  return mitsUnits;
};

export default mitsPropertyUnit;
