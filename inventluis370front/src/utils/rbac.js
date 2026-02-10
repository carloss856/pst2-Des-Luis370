const DEFAULT_SCHEMA_VERSION = 1;
const VERSION_KEY = 'rbac_cache_version';
const keyForVersion = (v) => `rbac_cache_v${v}`;

export const getRbacCache = () => {
  try {
    const ver = Number(localStorage.getItem(VERSION_KEY)) || DEFAULT_SCHEMA_VERSION;
    const keysToTry = [keyForVersion(ver)];
    if (ver !== DEFAULT_SCHEMA_VERSION) keysToTry.push(keyForVersion(DEFAULT_SCHEMA_VERSION));

    for (const k of keysToTry) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      return JSON.parse(raw);
    }

    return null;
  } catch {
    return null;
  }
};

export const setRbacCache = (rbac) => {
  try {
    if (!rbac) {
      const ver = Number(localStorage.getItem(VERSION_KEY)) || DEFAULT_SCHEMA_VERSION;
      localStorage.removeItem(keyForVersion(ver));
      localStorage.removeItem(keyForVersion(DEFAULT_SCHEMA_VERSION));
      localStorage.removeItem(VERSION_KEY);
      return;
    }

    const ver = Number(rbac?.schemaVersion) || DEFAULT_SCHEMA_VERSION;
    localStorage.setItem(VERSION_KEY, String(ver));
    localStorage.setItem(keyForVersion(ver), JSON.stringify(rbac));
  } catch {
    // ignore
  }
};

export const canModule = (rbac, moduleKey, action) => {
  if (!rbac || !moduleKey || !action) return false;
  const allowed = rbac?.modules?.[moduleKey];
  if (!Array.isArray(allowed)) return false;
  return allowed.includes(action);
};

export const canRoute = (rbac, routeName) => {
  if (!rbac || !routeName) return false;
  const routes = rbac?.routes;
  if (!Array.isArray(routes)) return false;
  return routes.includes(routeName);
};
