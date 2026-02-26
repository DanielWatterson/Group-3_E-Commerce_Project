// models/productModel.js
import { pool } from "../config/config.js";

export const getAllProducts = async () => {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
};

export const getProductById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE product_id = ?", [id]);
    return rows[0];
};

export const createProduct = async (product_name, product_price, quantity, image_url, has_warranty = false, warranty_period_months = null) => {
    const [rows] = await pool.query(
        "INSERT INTO products (product_name, product_price, quantity, image_url, has_warranty, warranty_period_months) VALUES (?, ?, ?, ?, ?, ?)",
        [product_name, product_price, quantity, image_url, has_warranty, warranty_period_months]
    );
    return rows;
};

export const updateProduct = async (id, product_name, product_price, quantity, has_warranty, warranty_period_months) => {
    const [rows] = await pool.query(
        "UPDATE products SET product_name = ?, product_price = ?, quantity = ?, has_warranty = ?, warranty_period_months = ? WHERE product_id = ?",
        [product_name, product_price, quantity, has_warranty, warranty_period_months, id]
    );
    return rows;
};

// Decrease stock when item is added to cart
export const decreaseStock = async (id, quantity = 1) => {
    const [rows] = await pool.query(
        "UPDATE products SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?",
        [quantity, id, quantity]
    );
    return rows;
};

// Increase stock when item is removed from cart
export const increaseStock = async (id, quantity = 1) => {
    const [rows] = await pool.query(
        "UPDATE products SET quantity = quantity + ? WHERE product_id = ?",
        [quantity, id]
    );
    return rows;
};

export const deleteProduct = async (id) => {
    const [rows] = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);
    return rows;
};

// Soft delete - just mark as inactive
export const softDeleteProduct = async (id) => {
    const [rows] = await pool.query(
        "UPDATE products SET is_active = FALSE, deleted_at = NOW() WHERE product_id = ?",
        [id]
    );
    return rows;
};

// Restore a soft-deleted product
export const restoreProduct = async (id) => {
    const [rows] = await pool.query(
        "UPDATE products SET is_active = TRUE, deleted_at = NULL WHERE product_id = ?",
        [id]
    );
    return rows;
};

// Get only active products (for normal queries)
export const getAllActiveProducts = async () => {
    const [rows] = await pool.query("SELECT * FROM products WHERE is_active = TRUE");
    return rows;
};

// Get all products including deleted (for admin)
export const getAllProductsIncludingDeleted = async () => {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
};

// Optional: Permanent delete (admin only)
export const permanentDeleteProduct = async (id) => {
    const [rows] = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);
    return rows;
};