// productController.js
import {
    getAllProducts as getAllProductsModel,
    getProductById as getProductByIdModel,
    createProduct as createProductModel,
    updateProduct as updateProductModel,
    deleteProduct as deleteProductModel
} from "../models/productModel.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProductsModel();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductByIdModel(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { product_name, product_price, quantity } = req.body;
        
        // Basic validation
        if (!product_name || !product_price || !quantity) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const product = await createProductModel(product_name, product_price, quantity);
        res.status(201).json({ 
            message: 'Product created successfully',
            productId: product.insertId,
            product 
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, product_price, quantity } = req.body;
        
        // Check if product exists first
        const existingProduct = await getProductByIdModel(id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = await updateProductModel(id, product_name, product_price, quantity);
        res.json({ 
            message: 'Product updated successfully',
            product 
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists first
        const existingProduct = await getProductByIdModel(id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = await deleteProductModel(id);
        res.json({ 
            message: 'Product deleted successfully',
            product 
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};