// orderItemController.js
import {
    getOrderItems as getOrderItemsModel,
    addOrderItem as addOrderItemModel,
    deleteOrderItem as deleteOrderItemModel,
    updateOrderItemQuantity as updateOrderItemQuantityModel
} from "../models/orderItemModel.js";

import { getOrderById } from "../models/orderModel.js";
import { getProductById } from "../models/productModel.js";

export const getOrderItems = async (req, res) => {
    try {
        const { id } = req.params;  // This is order_id
        
        // Check if order exists
        const order = await getOrderById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const items = await getOrderItemsModel(id);  // Use the renamed import
        res.json(items);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const addOrderItems = async (req, res) => {
    try {
        const { id } = req.params;  // This is order_id
        const { product_id, quantity } = req.body;
        
        // Validation
        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }
        
        // Check if order exists
        const order = await getOrderById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if product exists
        const product = await getProductById(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Check if enough quantity available
        if (product.quantity < quantity) {
            return res.status(400).json({ 
                error: 'Insufficient product quantity',
                available: product.quantity,
                requested: quantity
            });
        }
        
        const item = await addOrderItemModel(id, product_id, quantity);  // Use the renamed import
        
        // Get the complete item details to return
        const newItems = await getOrderItemsModel(id);  // Use the renamed import
        const addedItem = newItems.find(item => item.order_item_id === item.insertId);
        
        res.status(201).json({ 
            message: 'Order item added successfully',
            item: addedItem || item
        });
    } catch (error) {
        console.error('Error adding order item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteOrderItem = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        
        const result = await deleteOrderItemModel(orderItemId);  // Use the renamed import
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }
        
        res.json({ 
            message: 'Order item deleted successfully',
            result
        });
    } catch (error) {
        console.error('Error deleting order item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateOrderItemQuantity = async (req, res) => {
    try {
        const { orderItemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity) {
            return res.status(400).json({ error: 'Quantity is required' });
        }
        
        // Optional: Check if the order item exists and get product_id to check inventory
        const orderItems = await getOrderItemsByOrderItemId(orderItemId);
        if (!orderItems || orderItems.length === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }
        
        const result = await updateOrderItemQuantityModel(orderItemId, quantity);  // Use the renamed import
        
        res.json({ 
            message: 'Order item updated successfully',
            result
        });
    } catch (error) {
        console.error('Error updating order item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// You might also need this helper function
const getOrderItemsByOrderItemId = async (order_item_id) => {
    const [rows] = await pool.query(
        "SELECT * FROM order_items WHERE order_item_id = ?",
        [order_item_id]
    );
    return rows;
};