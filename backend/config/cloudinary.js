import crypto from "crypto";

/*
  Image uploads, signed here and sent straight from the browser.

  The obvious design is: browser sends the file to us, we forward it to
  Cloudinary. Don't. Every photo would travel twice, and sit in the memory of
  a 512MB box that also has to keep serving the shop.

  So the file goes browser -> Cloudinary directly, and this server's only job
  is to say "yes, this upload is allowed", by signing it. The API secret
  never leaves here.

      browser                 this API              Cloudinary
         |  ask for signature     |                     |
         |----------------------->|                     |
         |  timestamp+signature   |                     |
         |<-----------------------|                     |
         |  the file + signature ---------------------->|
         |  https://res.cloudinary.com/... <------------|

  No SDK. The signature is a sha1 of the parameters plus the secret, which is
  ten lines, and the upload itself is one POST the browser makes.
*/

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const folder = () => process.env.CLOUDINARY_FOLDER || "shopngo";

/*
  Cloudinary's rule: take the parameters you are going to send (except the
  file itself, the api_key and the cloud name), sort them by key, join them
  as a query string, append the secret, and sha1 the result.

  Sorting matters. "timestamp=1&folder=x" and "folder=x&timestamp=1" produce
  different hashes, so both sides have to agree on the order, and alphabetical
  is the agreement.
*/
const signUpload = (params) => {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(toSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");
};

/*
  Everything the browser needs for one upload.

  The timestamp is part of what is signed, and Cloudinary rejects anything
  more than an hour old - so a signature that leaks is worthless by teatime,
  and it only ever authorises an upload, never a delete or a read.
*/
const createUploadSignature = () => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: folder(), timestamp };

  return {
    ...params,
    signature: signUpload(params),
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};

export { isConfigured, createUploadSignature };
