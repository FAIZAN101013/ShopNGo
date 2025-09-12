import mongoose from "mongoose";

import userModel from "../models/userModel.js";

/*
  The cart, stored against the account instead of the browser.

  localStorage kept a cart on one machine, belonging to nobody. Add something
  on your phone and it was not there on your laptop; clear your browser data
  and it was gone. This is the same cart, kept where the account is.

  Guests still get the localStorage one - a shop that demands a login before
  it will hold a t-shirt for you is a shop people leave.
*/

// Sanity limits. Nothing here is about a real customer; it is about what an
// unfriendly script could POST if nobody was checking.
const MAX_PRODUCTS = 100;
const MAX_SIZES_PER_PRODUCT = 20;
const MAX_QUANTITY = 99;

/*
  Rebuild the cart from the request rather than trusting its shape.

  What arrives is meant to be { productId: { size: quantity } }, but this is
  a request body, so it could be anything at all - nested objects, strings
  where numbers go, ten thousand keys. Anything that does not fit the shape
  is dropped rather than argued about.

  Whether the products actually exist is deliberately not checked here. That
  would be a database query on every keystroke of a quantity box, and it is
  already checked properly at the only point it matters: placing the order.
*/
const cleanCart = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const cart = {};

  for (const [productId, sizes] of Object.entries(input).slice(0, MAX_PRODUCTS)) {
    // A key that is not an ObjectId cannot name a product, so it is junk.
    if (!mongoose.isValidObjectId(productId)) continue;
    if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) continue;

    const cleanSizes = {};

    for (const [size, quantity] of Object.entries(sizes).slice(0, MAX_SIZES_PER_PRODUCT)) {
      const amount = Number(quantity);
      if (!Number.isInteger(amount) || amount < 1) continue;
      if (!size || String(size).length > 20) continue;

      cleanSizes[size] = Math.min(amount, MAX_QUANTITY);
    }

    // A product with no sizes left is not in the cart at all. Keeping the
    // empty object would leave the browser showing a row with nothing in it.
    if (Object.keys(cleanSizes).length > 0) cart[productId] = cleanSizes;
  }

  return cart;
};

const getCart = async (req, res) => {
  res.json({ success: true, cart: req.user.cart || {} });
};

/*
  Replace the whole cart.

  Whole, rather than one item at a time, because the browser already knows
  what the cart should look like. Sending the finished state means a dropped
  request just loses one save instead of leaving the two copies disagreeing
  about a quantity forever.
*/
const saveCart = async (req, res) => {
  try {
    const cart = cleanCart(req.body.cart);

    // $set rather than assigning and calling save(): Mixed fields are not
    // watched for changes, so a plain assignment can be silently ignored.
    await userModel.updateOne({ _id: req.user._id }, { $set: { cart } });

    res.json({ success: true, cart });
  } catch (error) {
    console.error("save cart failed:", error);
    res.status(500).json({ success: false, message: "Could not save your cart" });
  }
};

export { getCart, saveCart };
