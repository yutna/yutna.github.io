// @ts-check
/**
 * Pure helpers for the built-site checks. Everything here turns strings into
 * strings or lists so it can be tested without a filesystem or a browser.
 */

const NOINDEX = /(?:^|[\s,])noindex(?:[\s,]|$)/i;
const SKIPPABLE = /^(?:#|mailto:|tel:|data:)/i;

/**
 * @param {string | undefined | null} value
 * @returns {boolean} true when a robots directive asks for no indexing
 */
export const containsNoindex = (value) =>
  typeof value === 'string' && NOINDEX.test(value);

/**
 * @param {string | undefined | null} value
 * @returns {boolean} true for anchors and URLs that do not point at the site
 */
export const isSkippableUrl = (value) =>
  typeof value === 'string' && (value.trim() === '' || SKIPPABLE.test(value.trim()));

/**
 * Split a `srcset` attribute into its URLs.
 *
 * @param {string | undefined | null} value
 * @returns {string[]}
 */
export const parseSrcset = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0] ?? '')
    .filter((url) => url !== '');
};

/**
 * Map a site pathname to the files Jekyll could have written for it, in the
 * order a static host would try them.
 *
 * @param {string} pathname
 * @returns {string[]} paths relative to `_site`
 */
export const fileCandidates = (pathname) => {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (decoded === '') return ['index.html'];
  if (decoded.endsWith('/')) return [`${decoded}index.html`];
  if (/\.[^/]+$/.test(decoded)) return [decoded];
  return [decoded, `${decoded}.html`, `${decoded}/index.html`];
};

/**
 * @param {string} text
 * @returns {boolean} true when Thai script reached the output
 */
export const containsThai = (text) => /[\u0e00-\u0e7f]/.test(text);

/**
 * @param {string} text
 * @returns {boolean} true when Liquid did not render
 */
export const containsLiquid = (text) => /\{\{|\{%/.test(text);

/**
 * Read the pixel size from a PNG header. Only the signature and the IHDR
 * chunk are inspected, which is enough to police the social card size
 * without decoding the image.
 *
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number } | null}
 */
export const pngSize = (buffer) => {
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
  if (buffer.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  if (buffer.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

/**
 * @param {number} count
 * @param {string} noun
 * @returns {string}
 */
export const plural = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;
