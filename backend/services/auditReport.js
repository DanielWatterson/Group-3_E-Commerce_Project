import pool from "../config/db.js";

class AuditReport {

  static async getDiscountUsageReport(startDate, endDate) {
    const [rows] = await pool.query(
      `
      SELECT 
        o.order_id,
        o.order_date,
        o.discount_percent,
        o.discount_amount,
        o.final_total,
        c.customer_name,
        c.email
      FROM orders o
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.discount_amount > 0
      AND o.order_date BETWEEN ? AND ?
      ORDER BY o.discount_amount DESC
      `,
      [startDate, endDate]
    );

    return {
      totalOrders: rows.length,
      totalDiscountGiven: rows.reduce((s, r) => s + Number(r.discount_amount || 0), 0),
      averageDiscountPercent:
        rows.length > 0
          ? rows.reduce((s, r) => s + Number(r.discount_percent || 0), 0) / rows.length
          : 0,
      daily_breakdown: rows
    };
  }

  static async getCustomerDiscountAnalysis() {
    const [rows] = await pool.query(`
      SELECT 
        c.customer_id,
        c.customer_name,
        c.email,
        COUNT(o.order_id) AS total_orders,
        SUM(o.discount_amount) AS total_discount_received,
        AVG(o.discount_percent) AS avg_discount_percent,
        SUM(o.final_total) AS total_spent
      FROM customer c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id
      HAVING total_orders > 0
      ORDER BY total_discount_received DESC
    `);

    return rows;
  }

  static async getProductDiscountImpact() {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        SUM(oi.quantity) AS total_sold,
        SUM(CASE WHEN o.discount_percent > 0 THEN oi.quantity ELSE 0 END) AS sold_with_discount,
        SUM(CASE WHEN o.discount_percent = 0 THEN oi.quantity ELSE 0 END) AS sold_full_price
      FROM products p
      JOIN order_items oi ON p.product_id = oi.product_id
      JOIN orders o ON oi.order_id = o.order_id
      GROUP BY p.product_id
      ORDER BY total_sold DESC
    `);

    return rows;
  }

  static generateCSV(data) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
      Object.values(row)
        .map(v => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
        .join(",")
    );

    return `${headers}\n${rows.join("\n")}`;
  }
}
export default AuditReport;