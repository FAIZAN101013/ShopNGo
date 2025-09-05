import mongoose from "mongoose";

/*
  A placed order.

  The line items copy the name, price and image that were on screen at the
  time instead of only pointing at a product. Prices change and products get
  deleted; a receipt has to keep saying what was actually bought and for how
  much, forever.
*/
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Every order belongs to somebody. This is what stops one person's
    // order history from being another person's.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // A short reference a human can read out on the phone. The real key is
    // still _id; this is for the confirmation email and the order card.
    reference: { type: String, required: true, unique: true },

    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    notes: { type: String, default: "" },

    // Money is recalculated on the server from the database price. Anything
    // the browser says a total is, is a suggestion from a stranger.
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },

    paymentMethod: { type: String, default: "COD" },
    status: {
      type: String,
      enum: ["CONFIRMED", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;
