import type { Core } from "@strapi/strapi";

import {
  findPropertySetting,
  saveAndPublishPropertySetting,
} from "../propertySettingDocument";
import type { ParsedSpecial } from "./parseEntrataSpecials";

const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

const preserveLinks = (existing: Record<string, unknown>) =>
  asArray(existing.links as Array<Record<string, unknown>>).map((link) => ({
    ...(link.id != null ? { id: link.id } : {}),
    text: link.text ?? "",
    href: link.href ?? "",
    target: link.target ?? "_blank",
  }));

const toFeedComponent = (
  feed: {
    special_name?: string | null;
    description?: string | null;
  },
  existing: Record<string, unknown> = {}
) => ({
  ...(existing.id != null ? { id: existing.id } : {}),
  title: existing.title ?? feed.special_name ?? "",
  specialTitle: feed.special_name ?? "",
  specialDescription: feed.description ?? "",
  isOverRide: Boolean(existing.isOverRide),
  showSpecials: existing.showSpecials !== false,
  overRideText: existing.overRideText ?? "",
  overRideDescription: existing.overRideDescription ?? "",
  links: preserveLinks(existing),
});

const toManualComponent = (existing: Record<string, unknown>) => ({
  ...(existing.id != null ? { id: existing.id } : {}),
  title: existing.title ?? existing.specialTitle ?? "",
  specialTitle: existing.specialTitle ?? existing.title ?? "",
  specialDescription: existing.specialDescription ?? "",
  isOverRide: false,
  overRideText: "",
  overRideDescription: "",
  links: preserveLinks(existing),
});

const syncPropertySetting = async (
  strapi: Core.Strapi,
  propertySpecials: ParsedSpecial[]
) => {
  if (!propertySpecials.length) {
    return;
  }

  const existing = await findPropertySetting(strapi);
  const existingTop = asArray(existing?.topSpecial);
  const existingPopup = (existing?.popupSpecial as Record<string, unknown>) || {};

  const data = {
    topSpecial: [
      toFeedComponent(propertySpecials[0], existingTop[0] || {}),
      ...existingTop.slice(1).map((item) =>
        toManualComponent(item as Record<string, unknown>)
      ),
    ],
    popupSpecial: toFeedComponent(propertySpecials[0], existingPopup),
  };

  await saveAndPublishPropertySetting(strapi, data as Record<string, unknown>);
};

export default syncPropertySetting;
