/**
 * Returns a shallow copy of `item` containing only the specified keys.
 * Used to trim Strapi documents before sending them in the feed JSON.
 */
const pick = (item: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]]));

export default pick;
