// services/discountService.js
import pool from "../config/db.js";

class DiscountService {
    
    static async getCustomerOrderCount(customerId) {
        const [rows] = await pool.query(
            "SELECT COUNT(*) as count FROM orders WHERE customer_id = ?",
            [customerId]
        );
        return rows[0].count;
    }
    
    static async getActiveRules() {
        const [rows] = await pool.query(`
            SELECT 
                dr.*,
                dc.condition_type,
                dc.operator,
                dc.condition_value
            FROM discount_rules dr
            LEFT JOIN discount_conditions dc ON dr.rule_id = dc.rule_id
            WHERE dr.is_active = TRUE
            ORDER BY dr.priority DESC
        `);
        return rows;
    }
    
    // 🔥 FIXED METHOD - Check for undefined
    static getApplicableDiscounts(rules, context) {
        if (!rules || rules.length === 0) return [];
        
        const { isFirstTime, subtotal, currentDate } = context;
        const applicableDiscounts = [];
        
        // Group rules by ID
        const ruleMap = new Map();
        
        rules.forEach(row => {
            if (!ruleMap.has(row.rule_id)) {
                ruleMap.set(row.rule_id, {
                    rule_id: row.rule_id,
                    rule_name: row.rule_name,
                    discount_type: row.discount_type,
                    discount_value: parseFloat(row.discount_value),
                    priority: row.priority,
                    conditions: []
                });
            }
            
            if (row.condition_type) {
                ruleMap.get(row.rule_id).conditions.push({
                    type: row.condition_type,
                    operator: row.operator,
                    value: row.condition_value
                });
            }
        });
        
        // Check each rule
        for (const [ruleId, rule] of ruleMap) {
            let ruleApplicable = true;
            
            // If no conditions, rule applies
            if (rule.conditions.length === 0) {
                applicableDiscounts.push(rule);
                continue;
            }
            
            // Check all conditions
            for (const condition of rule.conditions) {
                switch (condition.type) {
                    case 'first_time_purchase':
                        if (condition.value === 'true' && !isFirstTime) ruleApplicable = false;
                        if (condition.value === 'false' && isFirstTime) ruleApplicable = false;
                        break;
                        
                    case 'order_total_min':
                        if (subtotal < parseFloat(condition.value)) ruleApplicable = false;
                        break;
                        
                    case 'date_range':
                        const [start, end] = condition.value.split(',');
                        const now = currentDate || new Date();
                        if (now < new Date(start) || now > new Date(end)) ruleApplicable = false;
                        break;
                        
                    default:
                        // Unknown condition type
                        break;
                }
            }
            
            if (ruleApplicable) {
                applicableDiscounts.push(rule);
            }
        }
        
        return applicableDiscounts;
    }
    
    static async calculateBestDiscount(customerId, items, subtotal) {
        try {
            console.log('💰 Calculating discount for customer:', customerId);
            console.log('📦 Subtotal:', subtotal);
            
            const orderCount = await this.getCustomerOrderCount(customerId);
            const isFirstTime = orderCount === 0;
            const currentDate = new Date();
            
            console.log('👤 First time customer:', isFirstTime);
            
            const rules = await this.getActiveRules();
            console.log('📋 Found rules:', rules.length);
            
            // 🔥 USE THE FIXED METHOD
            const applicableDiscounts = this.getApplicableDiscounts(rules, {
                isFirstTime,
                subtotal,
                currentDate
            });
            
            console.log('✅ Applicable discounts:', applicableDiscounts.length);
            
            // Find best discount
            let bestDiscount = 0;
            let appliedRule = null;
            
            for (const rule of applicableDiscounts) {
                if (rule.discount_value > bestDiscount) {
                    bestDiscount = rule.discount_value;
                    appliedRule = rule;
                }
            }
            
            const discountAmount = (subtotal * bestDiscount) / 100;
            const finalTotal = subtotal - discountAmount;
            
            console.log('🎯 Best discount:', bestDiscount + '%');
            console.log('💰 Discount amount:', discountAmount);
            console.log('💵 Final total:', finalTotal);
            
            return {
                success: true,
                original_total: subtotal,
                discount_percent: bestDiscount,
                discount_amount: discountAmount,
                final_total: finalTotal,
                applied_rule: appliedRule ? {
                    id: appliedRule.rule_id,
                    name: appliedRule.rule_name,
                    value: appliedRule.discount_value
                } : null,
                is_first_time: isFirstTime
            };
            
        } catch (error) {
            console.error('❌ Discount calculation error:', error);
            return {
                success: false,
                original_total: subtotal,
                discount_percent: 0,
                discount_amount: 0,
                final_total: subtotal,
                applied_rule: null,
                is_first_time: false,
                error: error.message
            };
        }
    }
}

export default DiscountService;