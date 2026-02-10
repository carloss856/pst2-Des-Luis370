const memoryCache = new Map();

const now = () => Date.now();

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const safeJsonStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

const storageKey = (key) => `api_cache_v1:${key}`;

export const getCachedValue = (key) => {
  const mem = memoryCache.get(key);
  if (mem && typeof mem === 'object') return mem;

  const raw = localStorage.getItem(storageKey(key));
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  if (!parsed || typeof parsed !== 'object') return null;

  memoryCache.set(key, parsed);
  return parsed;
};

export const setCachedValue = (key, entry, { persist = true } = {}) => {
  memoryCache.set(key, entry);
  if (!persist) return;
  localStorage.setItem(storageKey(key), safeJsonStringify(entry));
};

export const clearCachedValue = (key) => {
  memoryCache.delete(key);
  localStorage.removeItem(storageKey(key));
};

export const cachedGet = async (
  key,
  fetcher,
  {
    ttlMs = 120_000,
    persist = true,
    backgroundRefresh = true,
  } = {}
) => {
  const entry = getCachedValue(key);
  const t = now();

  const isFresh = entry && typeof entry.exp === 'number' && entry.exp > t && 'data' in entry;
  if (isFresh) {
    if (backgroundRefresh) {
      // Stale-while-revalidate (silencioso)
      Promise.resolve()
        .then(async () => {
          const data = await fetcher();
          setCachedValue(key, { data, exp: t + ttlMs, ts: t }, { persist });
        })
        .catch(() => {});
    }
    return entry.data;
  }

  const data = await fetcher();
  setCachedValue(key, { data, exp: t + ttlMs, ts: t }, { persist });
  return data;
};

export const primeCache = async (
  key,
  fetcher,
  {
    ttlMs = 120_000,
    persist = true,
    minFreshMs = 5_000,
  } = {}
) => {
  const entry = getCachedValue(key);
  const t = now();
  const remaining = entry && typeof entry.exp === 'number' ? entry.exp - t : 0;

  // Si ya está fresco, no hacemos nada.
  if (entry && remaining > minFreshMs && 'data' in entry) {
    return entry.data;
  }

  const data = await fetcher();
  setCachedValue(key, { data, exp: t + ttlMs, ts: t }, { persist });
  return data;
};
