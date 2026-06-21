/**
 * Normalize an entity's identifier.
 *
 * The server is inconsistent: restaurants come back with a clean `id` (their
 * model has a toJSON transform), while products, orders, users and /search
 * results come back with Mongo's `_id`. Using this helper everywhere (keys,
 * navigation params, cart line ids) makes the app correct regardless of which
 * shape a given endpoint returns.
 */
export const getId = (entity) => {
    if (!entity) return undefined;
    return entity.id ?? entity._id ?? undefined;
};
