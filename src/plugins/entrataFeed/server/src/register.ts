import type { Core } from "@strapi/strapi";

import components from "./components";

const PLUGIN_NAME = "entratafeed";

const toKebabCase = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  Object.entries(components).forEach(([key, definition]) => {
    const { schema } = definition as { schema: Record<string, unknown> };
    const modelName = toKebabCase(key);
    const uid = `plugin::${PLUGIN_NAME}.${modelName}`;

    strapi.get("components").set(uid, {
      ...schema,
      __schema__: structuredClone(schema),
      __filename__: `${modelName}.json`,
      uid,
      category: PLUGIN_NAME,
      modelType: "component",
      modelName,
      globalId: `ComponentPluginEntratafeed${key[0].toUpperCase()}${key.slice(1)}`,
    });
  });
};

export default register;
