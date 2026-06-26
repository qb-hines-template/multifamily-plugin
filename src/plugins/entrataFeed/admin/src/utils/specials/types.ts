export type LinkTarget = "_blank" | "_self" | "_parent" | "_top";

export type LinkComponent = {
  id?: number | string;
  text?: string | null;
  href?: string | null;
  target?: LinkTarget | null;
};

export type LinkFormState = {
  clientId: string;
  componentId?: number;
  text: string;
  href: string;
  target: LinkTarget;
};

export type SpecialDetailsComponent = {
  id?: number | string;
  title?: string | null;
  specialTitle?: string | null;
  specialDescription?: string | null;
  isOverRide?: boolean | null;
  showSpecials?: boolean | null;
  overRideText?: string | null;
  overRideDescription?: string | null;
  links?: LinkComponent[] | null;
};

export type SpecialFormState = {
  componentId?: number;
  specialTitle: string;
  specialDescription: string;
  isOverRide: boolean;
  showSpecials: boolean;
  overRideText: string;
  overRideDescription: string;
  links: LinkFormState[];
};

export type ManualTopSpecial = {
  clientId: string;
  title: string;
  description: string;
  links: LinkFormState[];
};

export type PropertySettingForm = {
  feedTopSpecial: SpecialFormState;
  additionalTopSpecials: ManualTopSpecial[];
  popupSpecial: SpecialFormState;
};

export type PropertySettingResponse = {
  data?: {
    topSpecial?: SpecialDetailsComponent | SpecialDetailsComponent[] | null;
    popupSpecial?: SpecialDetailsComponent | null;
    manualTopSpecials?: SpecialDetailsComponent[] | null;
  };
  topSpecial?: SpecialDetailsComponent | SpecialDetailsComponent[] | null;
  popupSpecial?: SpecialDetailsComponent | null;
  manualTopSpecials?: SpecialDetailsComponent[] | null;
};
