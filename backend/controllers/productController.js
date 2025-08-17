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


const addProduct = async(req, res) => {

    try{
        const{ name, description, price, image, category, subCategory, sizes, bestseller } = req.body;

        const newProduct = new productModel({
            name,
            description,
            price,
            image,
            category,
            subCategory,
            sizes,
            bestseller
        });
        await newProduct.save();
        res.status(201).json({ success: true, message: "Product Added", product: newProduct })
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}






export { listProducts, addProduct };