/**
 * @typedef {object} ParseS3UrlReturn
 * @property {string} bucket - Name of S3 bucket
 * @property {string} key - Key of an object in bucket
 * @property {string} region - Region of bucket
 */

/**
 * Parses S3 url into pieces (HTTPS, S3 URI, ARN)
 * @param {string} url - S3 object's address
 * @returns {ParseS3UrlReturn}
 *          Object with data extracted from url
 */
function parseS3Url(url) {
    if (!url) {
        return {};
    }
    if (url.startsWith("https://")) {
        return parseS3HttpUrl(url);
    }
    if (url.startsWith("s3://")) {
        return parseS3Uri(url);
    }
    if (url.startsWith("arn:")) {
        return parseS3Arn(url);
    }
    throw new Error("Unknown protocol / url format: " + url);
}

/**
 * Parses S3 url into pieces (HTTPS)
 * @param {string} url
 * @returns {ParseS3UrlReturn}
 */
function parseS3HttpUrl(url) {
    const parsed = new URL(url);
    const { hostname } = parsed;
    let { pathname: key } = parsed;
    const isAWS = hostname.endsWith("amazonaws.com");
    if (!isAWS) return;
    const hostNameParts = hostname.split(".");
    const startsWithS3 = hostname.startsWith("s3");
    const containsS3 = hostname.indexOf(".s3");
    if (!containsS3 && !startsWithS3) return;
    const ipv6 = hostNameParts[startsWithS3 ? 1 : 2] === "dualstack";
    let bucket = hostNameParts[0];
    let region = hostNameParts[1];
    if (region == "s3") {
        region = hostNameParts[2];
    }
    if (region === "dualstack") {
        region = hostNameParts[startsWithS3 ? 2 : 3];
    }
    if (region && !ipv6 && region.startsWith("s3-")) {
        region = region.substring(3);
    }
    if (region === "amazonaws") {
        region = null;
    }
    if (startsWithS3 && hostNameParts.length === 4) {
        const keySplit = key.split("/");
        keySplit.shift();
        bucket = keySplit.shift();
        key = keySplit.join("/");
        region = hostNameParts[1];
    }
    return {
        bucket,
        region,
        key,
    };
}

/**
 * Parses S3 url into pieces (S3 URI)
 * @param {string} url
 * @returns {ParseS3UrlReturn}
 */
function parseS3Uri(url) {
    const parsed = new URL(url);
    return {
        bucket: parsed.hostname,
        region: null,
        key: parsed.pathname,
    };
}

/**
 * Parses S3 url into pieces (ARN)
 * @param {string} url
 * @returns {ParseS3UrlReturn}
 */
function parseS3Arn(url) {
    const split = url.split(":");
    const keySplit = split[5].split("/");
    const bucket = keySplit.shift();
    const key = keySplit.join("/");
    return {
        bucket,
        region: null,
        key,
    };
}

module.exports = parseS3Url;
