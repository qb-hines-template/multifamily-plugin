export type AssociationReference = {
  id: string | number;
  name?: string | null;
};

export type ParsedSpecial = {
  special_id: string | number | null;
  special_name: string | null;
  associations: string | null;
  description: string | null;
  terms_conditions: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  showOnWebsite: unknown;
  association_references: AssociationReference[] | null;
};

export type EntrataSpecialResponse = {
  success?: boolean;
  source?: string;
  response?: {
    code?: number;
    result?: {
      specialGroups?: Array<{
        specialGroupId?: string | number | null;
        specialGroupName?: string | null;
        associations?: {
          levelName?: string | null;
          references?: unknown;
        } | null;
        description?: string | null;
        termsAndConditions?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        isActive?: string | null;
        showOnWebsite?: unknown;
      }>;
    };
  };
};

const asReferences = (references: unknown): AssociationReference[] | null => {
  if (!Array.isArray(references)) {
    return null;
  }

  return references.filter(
    (item): item is AssociationReference =>
      Boolean(item && typeof item === "object" && "id" in item)
  );
};

const parseEntrataSpecials = async (data: EntrataSpecialResponse) => {
  if (data?.response?.code !== 200) {
    return { success: false, specials: [], association_groups: {}, total_count: 0 };
  }

  const specials: ParsedSpecial[] = (
    data.response.result.specialGroups || []
  ).map((group) => ({
    special_id: group.specialGroupId ?? null,
    special_name: group.specialGroupName ?? null,
    associations: group.associations?.levelName ?? null,
    description: group.description ?? null,
    terms_conditions: group.termsAndConditions ?? null,
    start_date: group.startDate ?? null,
    end_date: group.endDate ?? null,
    is_active: (group.isActive ?? "0") === "1",
    showOnWebsite: group.showOnWebsite ?? null,
    association_references: asReferences(group.associations?.references),
  }));

  const association_groups = specials.reduce<
    Record<
      string,
      { association_name: string; specials: ParsedSpecial[]; count: number }
    >
  >((acc, special) => {
    const key = special.associations || "unassigned";

    if (!acc[key]) {
      acc[key] = { association_name: key, specials: [], count: 0 };
    }

    acc[key].specials.push(special);
    acc[key].count += 1;

    return acc;
  }, {});

  return {
    success: data.success ?? true,
    specials,
    association_groups,
    total_count: specials.length,
    parsed_at: Date.now(),
    source: data.source ?? "api",
  };
};

export default parseEntrataSpecials;
