import { pool } from "../config/config.js";

export const getAllCustomers = async () => {
  let [data] = await pool.query("SELECT * FROM customer;");
  return data;
};

export const getCustomerById = async (id) => {
  let [data] = await pool.query("SELECT * FROM customer WHERE customer_id = ?", [id]);
  return data[0];
};

// 🔥 NEW: Get customer by email (since email is unique)
export const getCustomerByEmail = async (email) => {
  let [data] = await pool.query("SELECT * FROM customer WHERE email = ?", [email]);
  return data[0]; // Returns undefined if not found
};

// 🔥 NEW: Check if email exists (useful for validation)
export const checkEmailExists = async (email) => {
  let [data] = await pool.query("SELECT COUNT(*) as count FROM customer WHERE email = ?", [email]);
  return data[0].count > 0;
};

export const postCustomer = async (customer_name, email, password) => {
  // Optional: Check for duplicate before insert
  const exists = await checkEmailExists(email);
  if (exists) {
    throw new Error('Email already registered');
  }
  
  let [data] = await pool.query(
    "INSERT INTO customer (customer_name, email, password) VALUES (?, ?, ?)",
    [customer_name, email, password]
  );
  return data;
};

export const patchCustomer = async (id, customer_name, email, password) => {
  // If updating email, check it's not taken by another customer
  if (email) {
    let [existing] = await pool.query(
      "SELECT customer_id FROM customer WHERE email = ? AND customer_id != ?", 
      [email, id]
    );
    if (existing.length > 0) {
      throw new Error('Email already in use by another customer');
    }
  }
  
  let [data] = await pool.query(
    "UPDATE customer SET customer_name = ?, email = ?, password = ? WHERE customer_id = ?",
    [customer_name, email, password, id]
  );
  return data;
};

export const deleteCustomer = async (id) => {
  let [data] = await pool.query("DELETE FROM customer WHERE customer_id = ?", [id]);
  return data;
};

// 🔥 NEW: Find customer for login/authentication
export const authenticateCustomer = async (email, password) => {
  let [data] = await pool.query(
    "SELECT customer_id, customer_name, email FROM customer WHERE email = ? AND password = ?",
    [email, password]
  );
  return data[0]; // Returns customer info (without password) if found
};