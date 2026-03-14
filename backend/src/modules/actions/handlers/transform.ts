import type { ActionHandler } from '../types.js';

/**
 * Get value from object by path (e.g. "a.b.c"). No eval, safe MVP.
 */
function getByPath(obj: unknown, path: string): unknown {
  if (path === '' || path === '$') return obj;
  const keys = path.replace(/^\$\.?/, '').split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[k];
  }
  return current;
}

/**
 * Transform action: mapping from input to output.
 * mapping: { "outKey": "$.inputPath" } or { "outKey": "literal" }.
 * $.path uses dot notation, no eval. Literals are non-$. strings/numbers.
 */
export const transformHandler: ActionHandler = async (config, input) => {
  const mapping = config.mapping as Record<string, unknown> | undefined;
  if (!mapping || typeof mapping !== 'object') {
    return input && typeof input === 'object' ? { ...(input as Record<string, unknown>) } : {};
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mapping)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      out[key] = getByPath(input, value);
    } else {
      out[key] = value;
    }
  }
  return out;
};
