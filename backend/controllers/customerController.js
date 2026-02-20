import {
    getAllCustomers as getAllCustomersModel,
    getCustomerById as getCustomerByIdModel,
    getCustomerByEmail as getCustomerByEmailModel,  
    checkEmailExists as checkEmailExistsModel,      
    postCustomer as postCustomerModel,
    patchCustomer as patchCustomerModel,
    deleteCustomer as deleteCustomerModel,
    authenticateCustomer as authenticateCustomerModel 
} from "../models/customerModel.js";

import { hashPassword } from "../middleware/auth.js";

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await getAllCustomersModel();
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await getCustomerByIdModel(id);
        
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🔥 NEW: Get customer by email
export const getCustomerByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const customer = await getCustomerByEmailModel(email);
        
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer by email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🔥 NEW: Check if email exists
export const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.query;
        const exists = await checkEmailExistsModel(email);
        
        res.json({ 
            email, 
            exists,
            available: !exists 
        });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const postCustomer = async (req, res) => {
    try {
        const { customer_name, email, password } = req.body;
        
        if (!customer_name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if email already exists
        const exists = await checkEmailExistsModel(email);
        if (exists) {
            return res.status(409).json({ 
                error: 'Email already registered',
                message: 'This email is already in use. Please login or use a different email.'
            });
        }
        
        // 🔥 HASH THE PASSWORD BEFORE STORING
        const hashedPassword = await hashPassword(password);
        
        const customer = await postCustomerModel(customer_name, email, hashedPassword);
        
        // Get the created customer (without password for response)
        const newCustomer = await getCustomerByIdModel(customer.insertId);
        delete newCustomer.password;
        
        res.status(201).json({ 
            message: 'Customer created successfully',
            customer: newCustomer
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const patchCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, email, password } = req.body;
        
        const existingCustomer = await getCustomerByIdModel(id);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const customer = await patchCustomerModel(id, customer_name, email, password);
        
        const updatedCustomer = await getCustomerByIdModel(id);
        delete updatedCustomer.password;
        
        res.json({ 
            message: 'Customer updated successfully',
            customer: updatedCustomer
        });
    } catch (error) {
        if (error.message === 'Email already in use by another customer') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existingCustomer = await getCustomerByIdModel(id);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        await deleteCustomerModel(id);
        
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🔥 NEW: Login endpoint
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Get customer by email
        const customer = await getCustomerByEmailModel(email);
        
        if (!customer) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // 🔥 COMPARE with bcrypt
        const isPasswordValid = await comparePassword(password, customer.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate token
        const token = await createToken(email);
        
        // Remove password from response
        delete customer.password;
        
        res.json({ 
            message: 'Login successful',
            token,
            customer
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};