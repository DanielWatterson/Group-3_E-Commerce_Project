import { hashPassword, comparePassword, createToken } from "../middleware/auth.js";
import { getAllCustomer, postCustomer, getSingleCustomer } from "../models/usersDB.js";

export const getCustomersCon = async (req, res) => {
    try {
        const customers = await getAllCustomer();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postCustomerCon = async (req, res) => {
    try {
        const { customer_name, email, password } = req.body;
        let hashP = await hashPassword(password);
        await postCustomer(customer_name, email, hashP);
        res.json({ message: "Customer added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const loginCon = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const customer = await getSingleCustomer(email);

        if (!customer) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await comparePassword(password, customer.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = await createToken(email);
        return res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
