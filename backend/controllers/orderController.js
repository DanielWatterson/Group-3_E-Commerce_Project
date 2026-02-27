// orderController.js
import {
    getAllOrders as getAllOrdersMod,
    getOrderById as getOrderByIdMod,
    createOrder as createOrderMod,  
    updateOrder as updateOrderMod, 
    deleteOrder as deleteOrderMod   
} from "../models/orderModel.js";

import {
    addOrderItem as addOrderItemMod,
    getOrderItems as getOrderItemsMod
} from "../models/orderItemModel.js";

import { getCustomerById as getCustomerByIdModel } from "../models/customerModel.js";
import { getProductById as getProductByIdModel } from "../models/productModel.js";

// 🔥 IMPORT DISCOUNT SERVICE
import DiscountService from "../services/discountService.js";

// ============================================
// ORDER CONTROLLER FUNCTIONS
// ============================================

export const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersMod();
        
        // Get items for each order
        for (let order of orders) {
            order.items = await getOrderItemsMod(order.order_id);
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
        const order = await getOrderByIdMod(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get items for this order
        order.items = await getOrderItemsMod(id);
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { customer_id, items } = req.body;
        
        console.log('=== CREATE ORDER REQUEST ===');
        console.log('Customer ID:', customer_id);
        console.log('Items:', items);
        
        // Basic validation
        if (!customer_id || !items || !items.length) {
            return res.status(400).json({ 
                error: 'Customer ID and items are required' 
            });
        }
        
        // Check if customer exists
        const customer = await getCustomerByIdModel(customer_id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        // Calculate subtotal and validate products
        let subtotal = 0;
        const orderItems = [];
        const validatedItems = [];
        
        for (const item of items) {
            const { product_id, quantity } = item;
            
            // Check if product exists and get price
            const product = await getProductByIdModel(product_id);
            if (!product) {
                return res.status(404).json({ 
                    error: `Product with ID ${product_id} not found` 
                });
            }
            
            // Check stock
            if (product.quantity < quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for product: ${product.product_name}` 
                });
            }
            
            // Calculate item total
            const itemTotal = parseFloat(product.product_price) * quantity;
            subtotal += itemTotal;
            
            orderItems.push({
                product_id,
                quantity,
                product_name: product.product_name,
                unit_price: product.product_price,
                item_total: itemTotal
            });
            
            // Store for discount service
            validatedItems.push({
                product_id,
                quantity,
                price: parseFloat(product.product_price)
            });
        }
        
        console.log('Subtotal calculated:', subtotal);
        
        // 🔥 USE DISCOUNT SERVICE FOR CALCULATION
        const discountInfo = await DiscountService.calculateBestDiscount(
            customer_id,
            validatedItems,
            subtotal
        );
        
        console.log('Discount info from service:', discountInfo);
        
        // Create order with discount info
        const orderResult = await createOrderMod(
            customer_id,
            discountInfo.original_total,
            discountInfo.final_total,
            discountInfo.discount_percent,
            discountInfo.discount_amount
        );
        
        const orderId = orderResult.insertId;
        console.log('Order created with ID:', orderId);
        
        // Add items to the order
        for (const item of items) {
            await addOrderItemMod(
                orderId, 
                item.product_id, 
                item.quantity
            );
            console.log(`Added item: Product ${item.product_id}, Quantity ${item.quantity}`);
        }
        
        // Get the complete order with items
        const newOrder = await getOrderByIdMod(orderId);
        newOrder.items = await getOrderItemsMod(orderId);
        
        // Add discount info to response
        newOrder.discount_summary = {
            original_total: discountInfo.original_total,
            discount_percent: discountInfo.discount_percent,
            discount_amount: discountInfo.discount_amount,
            final_total: discountInfo.final_total,
            applied_rule: discountInfo.applied_rule?.name || 'None',
            is_first_time: discountInfo.is_first_time
        };
        
        console.log('Order created successfully:', orderId);
        console.log('============================\n');
        
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
        const existingOrder = await getOrderByIdMod(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update the order
        await updateOrderMod(id, order_status);
        
        // Get updated order
        const updatedOrder = await getOrderByIdMod(id);
        updatedOrder.items = await getOrderItemsMod(id);
        
        res.json({ 
            message: 'Order updated successfully',
            order: updatedOrder 
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
        const existingOrder = await getOrderByIdMod(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        await deleteOrderMod(id);
        
        res.json({ 
            message: 'Order deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🔥 NEW ENDPOINT: Preview discount without creating order
export const previewDiscount = async (req, res) => {
    try {
        const { customer_id, items } = req.body;
        
        if (!customer_id || !items || !items.length) {
            return res.status(400).json({ 
                error: 'Customer ID and items are required' 
            });
        }
        
        // Calculate subtotal
        let subtotal = 0;
        const validatedItems = [];
        
        for (const item of items) {
            const product = await getProductByIdModel(item.product_id);
            if (!product) {
                return res.status(404).json({ 
                    error: `Product ${item.product_id} not found` 
                });
            }
            
            const itemTotal = parseFloat(product.product_price) * item.quantity;
            subtotal += itemTotal;
            
            validatedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(product.product_price)
            });
        }
        
        // Get discount preview
        const discountInfo = await DiscountService.calculateBestDiscount(
            customer_id,
            validatedItems,
            subtotal
        );
        
        res.json({
            subtotal,
            discount: discountInfo
        });
        
    } catch (error) {
        console.error('Error previewing discount:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};