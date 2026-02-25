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

export const createProduct = async (product_name, product_price, quantity, image_url) => {
    const [rows] = await pool.query(
        "INSERT INTO products (product_name, product_price, quantity, image_url) VALUES (?, ?, ?, ?)",
        [product_name, product_price, quantity, image_url]
    );
    return rows;
};

export const updateProduct = async (id, product_name, product_price, quantity) => {
    const [rows] = await pool.query(
        "UPDATE products SET product_name = ?, product_price = ?, quantity = ? WHERE product_id = ?",
        [product_name, product_price, quantity, id]
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