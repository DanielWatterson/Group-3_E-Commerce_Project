import { hashPassword } from "../middleware/auth.js";
import { getAllCustomer, postCustomer } from "../model/usersDB.js";

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
