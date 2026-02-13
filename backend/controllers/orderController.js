import {
    getAllOrders as getAllOrdersModel,
    getOrderById as getOrderByIdModel,
    createOrder as createOrderModel,
    updateOrder as updateOrderModel,
    deleteOrder as deleteOrderModel,
    addOrderItem,
    getOrderItems
} from "../models/orderModel.js";

import { getCustomerById as getCustomerByIdModel } from "../models/customerModel.js";
import { getProductById as getProductByIdModel } from "../models/productModel.js";

export const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersModel();
        
        // Get items for each order
        for (let order of orders) {
            order.items = await getOrderItems(order.order_id);
        }
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderByIdModel(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get items for this order
        order.items = await getOrderItems(id);
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { customer_id, items } = req.body; // items should be array of {product_id, quantity}
        
        // Basic validation
        if (!customer_id || !items || !items.length) {
            return res.status(400).json({ error: 'Customer ID and items are required' });
        }
        
        // Check if customer exists
        const customer = await getCustomerByIdModel(customer_id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Create the order
        const order = await createOrderModel(customer_id);
        const orderId = order.insertId;
        
        // Add items to the order
        for (const item of items) {
            const { product_id, quantity } = item;
            
            // Check if product exists
            const product = await getProductByIdModel(product_id);
            if (!product) {
                return res.status(404).json({ error: `Product ${product_id} not found` });
            }
            
            // Add item to order_items table
            await addOrderItem(orderId, product_id, quantity);
        }
        
        // Get the complete order with items
        const newOrder = await getOrderByIdModel(orderId);
        newOrder.items = await getOrderItems(orderId);
        
        res.status(201).json({ 
            message: 'Order created successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status } = req.body;
        
        // Check if order exists first
        const existingOrder = await getOrderByIdModel(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = await updateOrderModel(id, existingOrder.customer_id, order_status);
        
        res.json({ 
            message: 'Order updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if order exists first
        const existingOrder = await getOrderByIdModel(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = await deleteOrderModel(id);
        res.json({ 
            message: 'Order deleted successfully',
            order 
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};