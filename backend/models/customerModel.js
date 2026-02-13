import { pool } from "../config/config.js";

export const getAllCustomers = async () => {
  let [data] = await pool.query("SELECT * FROM customer;");
  return data;
};

export const getCustomerById = async (id) => {
  let [data] = await pool.query("SELECT * FROM customer WHERE customer_id = ?", [id]);
  return data[0];
};

export const postCustomer = async (customer_name, email, password) => {
  let [data] = await pool.query(
    "INSERT INTO customer (customer_name, email, password) VALUES (?, ?, ?)",
    [customer_name, email, password]
  );
  return data;
};

export const patchCustomer = async (id, customer_name, email, password) => {
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