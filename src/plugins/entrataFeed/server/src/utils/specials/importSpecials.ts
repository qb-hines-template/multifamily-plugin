import type { Core } from "@strapi/strapi";

import parseEntrataSpecials, {
  type EntrataSpecialResponse,
  type ParsedSpecial,
} from "./parseEntrataSpecials";
import syncCollectionSpecial from "./syncCollectionSpecial";
import syncPropertySetting from "./syncPropertySetting";

const isBaseEligible = (item: ParsedSpecial) =>
  item.is_active &&
  Number(item.showOnWebsite) === 1 &&
  (!item.end_date || Date.now() <= new Date(item.end_date).getTime());

const isPropertyLevel = (item: ParsedSpecial) =>
  (item.associations ?? "").trim().toLowerCase() === "property";

const importSpecials = async (
  strapi: Core.Strapi,
  response: EntrataSpecialResponse
) => {
  const { success, specials } = await parseEntrataSpecials(response);

  if (!success) {
    return;
  }

  const eligible = (specials || []).filter(isBaseEligible);
  const propertySpecials = eligible.filter(isPropertyLevel);

  if (propertySpecials.length) {
    await syncPropertySetting(strapi, propertySpecials);
  }

  const collectionSpecials = eligible.filter((item) => !isPropertyLevel(item));

  if (collectionSpecials.length) {
    await syncCollectionSpecial(strapi, collectionSpecials);
  }
};

export default importSpecials;
