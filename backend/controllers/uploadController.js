import { isConfigured, createUploadSignature } from "../config/cloudinary.js";

/*
  Hand an admin one signed permission to upload one image.

  Nothing is stored here and no file arrives here. This route exists purely
  so the browser can prove to Cloudinary that the shop said yes.
*/
const getUploadSignature = async (req, res) => {
  if (!isConfigured()) {
    // 503, not 500: nothing is broken, a feature simply has not been set up.
    return res.status(503).json({
      success: false,
      message: "Image uploads are not configured. Add the CLOUDINARY_* variables.",
    });
  }

  res.json({ success: true, upload: createUploadSignature() });
};

export { getUploadSignature };
