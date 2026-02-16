import pool from "../config/db.js";

export const getAllCustomer = async () => {
    const [rows] = await pool.query("SELECT * FROM customer;");
    return rows;
};

export const postCustomer = async (customer_name, email, password) => {
    try {
        await pool.query(
            "INSERT INTO customer (customer_name, email, password) VALUES (?, ?, ?)",
            [customer_name, email, password],
        );
    } catch (error) {
        console.error("Error inserting customer:", error);
        return error;
    }
};
