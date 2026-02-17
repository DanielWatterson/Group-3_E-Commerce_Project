// Rename imports to avoid conflicts and match actual model function names
import {
    getAllCustomers as getAllCustomersModel,
    getCustomerById as getCustomerByIdModel,
    postCustomer as postCustomerModel,
    patchCustomer as patchCustomerModel,
    deleteCustomer as deleteCustomerModel
} from "../models/customerModel.js";

// Keep the same export name for routes
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await getAllCustomersModel();  // Use renamed import
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
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const postCustomer = async (req, res) => {
    try {
        const { customer_name, email, password } = req.body;
        const customer = await postCustomerModel(customer_name, email, password);
        res.json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Rename to patchCustomer (matches route and import)
export const patchCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, email, password } = req.body;
        const customer = await patchCustomerModel(id, customer_name, email, password); 
        res.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await deleteCustomerModel(id);
        res.json(customer);
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};