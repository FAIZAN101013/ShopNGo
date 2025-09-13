import mongoose from "mongoose";

import productModel from "../models/productModel.js";

const listProducts = async(req, res) => {

try{

    const products= await productModel.find({});
    res.status(200).json({success: true, products});
}catch(error){
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error fetching products" });
}

}

/*
  Shared by add and update, because "what counts as a valid product" should
  have one answer. Mongoose would reject a bad one anyway, but its error is a
  ValidationError that reads like a stack trace - this turns the same problem
  into a sentence an admin can act on.
*/
const readProductFields = (body) => {
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const subCategory = String(body.subCategory || "").trim();
    const price = Number(body.price);

    // The form sends these as arrays, but a hand-written request might send
    // one string, and an empty box should not become a real entry.
    const toList = (value) =>
        (Array.isArray(value) ? value : String(value || "").split(","))
            .map((item) => String(item).trim())
            .filter(Boolean);

    const image = toList(body.image);
    const sizes = toList(body.sizes);

    if (!name) return { error: "Give the product a name" };
    if (!description) return { error: "Give the product a description" };
    if (!Number.isFinite(price) || price <= 0) return { error: "Price must be a number above zero" };
    if (!category) return { error: "Choose a category" };
    if (!subCategory) return { error: "Choose a type" };
    if (image.length === 0) return { error: "Add at least one image" };
    if (sizes.length === 0) return { error: "Add at least one size" };

    return {
        fields: {
            name,
            description,
            price,
            image,
            category,
            subCategory,
            sizes,
            bestseller: Boolean(body.bestseller),
        },
    };
};

const addProduct = async(req, res) => {

    try{
        const { error, fields } = readProductFields(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        const newProduct = new productModel(fields);
        await newProduct.save();
        res.status(201).json({ success: true, message: "Product Added", product: newProduct })
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "That is not a product id" });
        }

        const { error, fields } = readProductFields(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        // new: true returns the updated document rather than the old one, so
        // the admin page can show what was actually saved instead of what it
        // hoped it saved.
        const product = await productModel.findByIdAndUpdate(req.params.id, fields, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        res.json({ success: true, message: "Product updated", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/*
  Deleting only removes it from the shop. Orders keep their own copy of the
  name, price and image, so last month's receipt still reads correctly for
  something that is no longer sold.
*/
const removeProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "That is not a product id" });
        }

        const product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        res.json({ success: true, message: `Removed ${product.name}` });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { listProducts, addProduct, updateProduct, removeProduct };
