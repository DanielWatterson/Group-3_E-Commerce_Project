// controllers/productController.js
import {
    getAllProducts as getAllProductsMod,
    getProductById as getProductByIdMod,
    createProduct as createProductMod,
    updateProduct as updateProductMod,
    decreaseStock as decreaseStockMod,
    increaseStock as increaseStockMod,
    deleteProduct as deleteProductMod
} from "../models/productModel.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProductsMod();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await getProductByIdMod(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

        export const getProductsWithWarranty = async (req, res) => {
    try {
        const products = await getAllProductsMod();
        const withWarranty = products.filter(p => p.has_warranty === 1 || p.has_warranty === true);
        res.json(withWarranty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { product_name, description, product_price, quantity, image_url, has_warranty = false, warranty_period_months = null } = req.body;
        const result = await createProductMod(product_name, description, product_price, quantity, image_url, has_warranty, warranty_period_months);
        res.status(201).json({ 
            message: "Product created", 
            product_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, description, product_price, quantity, has_warranty, warranty_period_months } = req.body;
        
        await updateProductMod(id, product_name, description, product_price, quantity, has_warranty, warranty_period_months);
        
        const updatedProduct = await getProductByIdMod(id);
        res.json({ 
            message: "Product updated", 
            product: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Decrease stock (called when item added to cart)
export const decreaseStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;
        
        const product = await getProductByIdMod(id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        
        if (product.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }
        
        const result = await decreaseStockMod(id, quantity);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Failed to update stock" });
        }
        
        const updatedProduct = await getProductByIdMod(id);
        res.json({ 
            message: "Stock updated", 
            product: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Increase stock (called when item removed from cart)
export const increaseStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;
        
        await increaseStockMod(id, quantity);
        
        const updatedProduct = await getProductByIdMod(id);
        res.json({ 
            message: "Stock restored", 
            product: updatedProduct 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// export const deleteProduct = async (req, res) => {
//     try {
//         await deleteProductMod(req.params.id);
//         res.json({ message: "Product deleted" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Soft delete
export const deleteProduct = async (req, res) => {
    try {
        await softDeleteProduct(req.params.id);
        res.json({ message: "Product deactivated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Restore product
export const restoreProduct = async (req, res) => {
    try {
        await restoreProduct(req.params.id);
        res.json({ message: "Product restored successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};