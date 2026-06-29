import { FLOOR_PLAN_CONFIGURATION_UID } from "../../constants/api-constants";
import { getEngrainData } from "./fetchEngrain";
import { Core } from '@strapi/strapi';

const updateEngrainPrice = async (strapi: Core.Strapi) => {
  try {
    const data = await strapi
      .documents(FLOOR_PLAN_CONFIGURATION_UID)
      .findFirst({
        status: "published",
      });
    const { config }  = await getEngrainData(data.documentId);

    return config;

  } catch (error) {
    throw new Error("Failed to update engrain price");
  }
}

export default updateEngrainPrice;