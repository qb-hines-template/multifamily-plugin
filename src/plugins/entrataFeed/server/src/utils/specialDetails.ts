export const stripSpecialDetailsMetadata = (item: Record<string, unknown> | null | undefined) => {
  if (!item) {
    return null;
  }

  const { id: _id, documentId: _documentId, __component: _component, ...fields } = item;

  return fields;
};

export const toSpecialDetailsComponent = (
  parsed: {
    special_name?: string | null;
    description?: string | null;
  },
  existing?: Record<string, unknown> | null
) => ({
  title: parsed.special_name ?? '',
  specialTitle: parsed.special_name ?? '',
  specialDescription: parsed.description ?? '',
  isOverRide: Boolean(existing?.isOverRide),
  showSpecials: existing?.showSpecials !== false,
  overRideText: existing?.overRideText ?? '',
  overRideDescription: existing?.overRideDescription ?? '',
  links: Array.isArray(existing?.links) ? existing.links : [],
});
