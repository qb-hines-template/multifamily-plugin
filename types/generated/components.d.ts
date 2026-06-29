import type { Schema, Struct } from '@strapi/strapi';

export interface PluginEntratafeedApiParams extends Struct.ComponentSchema {
  collectionName: 'components_entratafeed_api-params';
  info: {
    description: '';
    displayName: 'API Params';
    icon: 'code';
  };
  attributes: {
    allowLeaseExpirationOverride: Schema.Attribute.Boolean;
    availableUnitsOnly: Schema.Attribute.Boolean;
    includeDisabledFloorplans: Schema.Attribute.Boolean;
    includeDisabledUnits: Schema.Attribute.Boolean;
    showUnitSpaces: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    skipPricing: Schema.Attribute.Boolean;
    unavailableUnitsOnly: Schema.Attribute.Boolean;
    useSpaceConfiguration: Schema.Attribute.Boolean;
  };
}

export interface PluginEntratafeedFloorplanCard extends Struct.ComponentSchema {
  collectionName: 'components_entratafeed_floorplan-card';
  info: {
    description: '';
    displayName: 'Floorplan Card';
    icon: 'code';
  };
  attributes: {
    cardButtonType: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.DefaultTo<'primary'>;
    initialListingType: Schema.Attribute.Enumeration<['grid', 'list', 'map']> &
      Schema.Attribute.DefaultTo<'grid'>;
    listingType: Schema.Attribute.Enumeration<['grid', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
    paginationLimit: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    paginationType: Schema.Attribute.Enumeration<['number', 'loadMore']> &
      Schema.Attribute.DefaultTo<'number'>;
  };
}

export interface PluginEntratafeedLink extends Struct.ComponentSchema {
  collectionName: 'components_entratafeed_link';
  info: {
    description: '';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<
      ['_blank', '_self', '_parent', '_top']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'_blank'>;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
        minLength: 1;
      }>;
  };
}

export interface PluginEntratafeedList extends Struct.ComponentSchema {
  collectionName: 'components_entratafeed_lists';
  info: {
    displayName: 'List';
  };
  attributes: {
    list: Schema.Attribute.Text;
  };
}

export interface PluginEntratafeedSpecialDetails
  extends Struct.ComponentSchema {
  collectionName: 'components_entratafeed_special_details';
  info: {
    description: '';
    displayName: 'Special Details';
    icon: 'priceTag';
  };
  attributes: {
    isOverRide: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    links: Schema.Attribute.Component<'plugin::entratafeed.link', true>;
    overRideDescription: Schema.Attribute.Text;
    overRideText: Schema.Attribute.Text;
    showSpecials: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    specialDescription: Schema.Attribute.Text;
    specialTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'plugin::entratafeed.api-params': PluginEntratafeedApiParams;
      'plugin::entratafeed.floorplan-card': PluginEntratafeedFloorplanCard;
      'plugin::entratafeed.link': PluginEntratafeedLink;
      'plugin::entratafeed.list': PluginEntratafeedList;
      'plugin::entratafeed.special-details': PluginEntratafeedSpecialDetails;
    }
  }
}
