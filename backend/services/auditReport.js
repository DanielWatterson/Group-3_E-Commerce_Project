// services/auditReport.js - ONLY service code, NO routes!
import pool from "../config/db.js";

class AuditReport {
  
  static async getDiscountUsageReport(startDate, endDate) {
    try {
      const [orders] = await pool.query(
        `SELECT 
            o.*, 
            c.customer_name,
            c.email
         FROM orders o
         JOIN customer c ON o.customer_id = c.customer_id
         WHERE o.discount_amount > 0
         AND o.order_date BETWEEN ? AND ?
         ORDER BY o.discount_amount DESC`,
        [startDate, endDate]
      );
      
      const summary = {
        totalOrders: orders.length,
        totalDiscountGiven: orders.reduce((sum, o) => sum + parseFloat(o.discount_amount || 0), 0),
        averageDiscountPercent: orders.length > 0 
          ? orders.reduce((sum, o) => sum + parseFloat(o.discount_percent || 0), 0) / orders.length 
          : 0,
        daily_breakdown: orders
      };
      
      return summary;
      
    } catch (error) {
      console.error('Error in getDiscountUsageReport:', error);
      throw error;
    }
  }
  
  static async getCustomerDiscountAnalysis() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          c.customer_id,
          c.customer_name,
          c.email,
          COUNT(o.order_id) as total_orders,
          SUM(CASE WHEN o.discount_percent > 0 THEN 1 ELSE 0 END) as orders_with_discount,
          SUM(o.discount_amount) as total_discount_received,
          AVG(o.discount_percent) as avg_discount_percent,
          SUM(o.final_total) as total_spent
        FROM customer c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        GROUP BY c.customer_id, c.customer_name, c.email
        HAVING total_orders > 0
        ORDER BY total_discount_received DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Error in customer analysis:', error);
      throw error;
    }
  }
  
  static async getProductDiscountImpact() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.product_id,
          p.product_name,
          p.product_price,
          SUM(oi.quantity) as total_sold,
          COUNT(DISTINCT o.order_id) as times_ordered,
          SUM(CASE WHEN o.discount_percent > 0 THEN oi.quantity ELSE 0 END) as sold_with_discount,
          SUM(CASE WHEN o.discount_percent = 0 THEN oi.quantity ELSE 0 END) as sold_full_price
        FROM products p
        LEFT JOIN order_items oi ON p.product_id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.order_id
        GROUP BY p.product_id, p.product_name, p.product_price
        HAVING total_sold > 0
        ORDER BY total_sold DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Error in product impact:', error);
      throw error;
    }
  }
  
  static generateCSV(data, filename) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  }
}

export default AuditReport;