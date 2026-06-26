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
