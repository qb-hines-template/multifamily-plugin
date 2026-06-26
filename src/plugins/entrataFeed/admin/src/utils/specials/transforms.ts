import type {
  LinkComponent,
  LinkFormState,
  LinkTarget,
  ManualTopSpecial,
  PropertySettingForm,
  SpecialDetailsComponent,
  SpecialFormState,
} from "./types";

const asArray = <T>(value: T | T[] | null | undefined): T[] =>
  !value ? [] : Array.isArray(value) ? value : [value];

export const createLink = (): LinkFormState => ({
  clientId: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text: "",
  href: "",
  target: "_blank",
});

export const toLinkFormState = (
  link: LinkComponent,
  index: number
): LinkFormState => ({
  clientId:
    link.id !== undefined && link.id !== null
      ? String(link.id)
      : `link-${index + 1}`,
  componentId:
    link.id !== undefined && link.id !== null ? Number(link.id) : undefined,
  text: link.text || "",
  href: link.href || "",
  target: (link.target as LinkTarget) || "_blank",
});

export const toLinkPayload = (link: LinkFormState) => ({
  ...(link.componentId != null ? { id: link.componentId } : {}),
  text: link.text,
  href: link.href,
  target: link.target,
});

export const emptySpecial = (): SpecialFormState => ({
  specialTitle: "",
  specialDescription: "",
  isOverRide: false,
  showSpecials: true,
  overRideText: "",
  overRideDescription: "",
  links: [],
});

export const emptyPropertySettingForm = (): PropertySettingForm => ({
  feedTopSpecial: emptySpecial(),
  additionalTopSpecials: [],
  popupSpecial: emptySpecial(),
});

export const toFormState = (
  special: SpecialDetailsComponent | null | undefined
): SpecialFormState => ({
  componentId:
    special?.id !== undefined && special?.id !== null
      ? Number(special.id)
      : undefined,
  specialTitle: special?.specialTitle || "",
  specialDescription: special?.specialDescription || "",
  isOverRide: Boolean(special?.isOverRide),
  showSpecials: special?.showSpecials !== false,
  overRideText: special?.overRideText || "",
  overRideDescription: special?.overRideDescription || "",
  links: asArray(special?.links).map(toLinkFormState),
});

export const toPayload = (special: SpecialFormState) => ({
  ...(special.componentId != null ? { id: special.componentId } : {}),
  title: special.specialTitle,
  specialTitle: special.specialTitle,
  specialDescription: special.specialDescription,
  isOverRide: special.isOverRide,
  showSpecials: special.showSpecials,
  overRideText: special.overRideText,
  overRideDescription: special.overRideDescription,
  links: special.links.map(toLinkPayload),
});

const toManualFormState = (
  special: SpecialDetailsComponent,
  clientId: string
): ManualTopSpecial => ({
  clientId,
  title: special.title || special.specialTitle || "",
  description: special.specialDescription || "",
  links: asArray(special.links).map(toLinkFormState),
});

const toManualPayload = (special: ManualTopSpecial) => {
  const componentId = /^\d+$/.test(special.clientId)
    ? Number(special.clientId)
    : undefined;

  return {
    ...(componentId != null ? { id: componentId } : {}),
    title: special.title,
    specialTitle: special.title,
    specialDescription: special.description,
    isOverRide: false,
    showSpecials: true,
    overRideText: "",
    overRideDescription: "",
    links: special.links.map(toLinkPayload),
  };
};

export const createManualTopSpecial = (): ManualTopSpecial => ({
  clientId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  description: "",
  links: [],
});

export const loadTopSpecialsFromSetting = (setting: {
  topSpecial?: SpecialDetailsComponent | SpecialDetailsComponent[] | null;
  manualTopSpecials?: SpecialDetailsComponent[] | null;
}) => {
  let items: SpecialDetailsComponent[] = [];

  if (Array.isArray(setting.topSpecial)) {
    items = setting.topSpecial;
  } else if (setting.topSpecial) {
    items = [setting.topSpecial];
  }

  if (setting.manualTopSpecials?.length) {
    items = [...items, ...setting.manualTopSpecials];
  }

  return {
    feedTopSpecial: toFormState(items[0]),
    additionalTopSpecials: items.slice(1).map((item, index) =>
      toManualFormState(
        item,
        item.id !== undefined && item.id !== null
          ? String(item.id)
          : `manual-${index + 1}`
      )
    ),
  };
};

export const toPropertySettingForm = (setting: {
  topSpecial?: SpecialDetailsComponent | SpecialDetailsComponent[] | null;
  popupSpecial?: SpecialDetailsComponent | null;
  manualTopSpecials?: SpecialDetailsComponent[] | null;
}): PropertySettingForm => ({
  ...loadTopSpecialsFromSetting(setting),
  popupSpecial: toFormState(setting.popupSpecial),
});

export const toPropertySettingPayload = (
  form: PropertySettingForm,
  publish = false
) => ({
  topSpecial: [
    toPayload(form.feedTopSpecial),
    ...form.additionalTopSpecials.map(toManualPayload),
  ],
  popupSpecial: toPayload(form.popupSpecial),
  ...(publish ? { publish: true } : {}),
});
