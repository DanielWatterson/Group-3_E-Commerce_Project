// services/discountService.js

class DiscountService {
  // Define rules in code (easier to manage)
  static getApplicableDiscounts(customer, orderTotal, products) {
    const discounts = [];
    
    // Rule 1: First-time buyer
    if (customer.orderCount === 0) {
      discounts.push({
        name: 'First Time Buyer',
        percent: 35,
        type: 'first_purchase'
      });
    }
    
    // Rule 2: Order total threshold
    if (orderTotal >= 5000) {
      discounts.push({
        name: 'Bulk Saver',
        percent: 15,
        type: 'volume'
      });
    }
    
    // Rule 3: Seasonal (check dates)
    const currentDate = new Date();
    if (currentDate.getMonth() === 2) { // March
      discounts.push({
        name: 'March Madness',
        percent: 20,
        type: 'seasonal'
      });
    }
    
    // Rule 4: Product-specific
    const hasDesk = products.some(p => p.name.includes('Desk'));
    if (hasDesk) {
      discounts.push({
        name: 'Desk Special',
        percent: 10,
        type: 'product'
      });
    }
    
    return discounts;
  }
  
  // Calculate best discount (non-stackable)
  static calculateBestDiscount(customer, orderTotal, products) {
    const discounts = this.getApplicableDiscounts(customer, orderTotal, products);
    
    if (discounts.length === 0) {
      return {
        percent: 0,
        amount: 0,
        finalTotal: orderTotal,
        appliedRules: []
      };
    }
    
    // Get highest percentage (or implement priority logic)
    const bestDiscount = discounts.reduce((max, d) => 
      d.percent > max.percent ? d : max
    );
    
    const discountAmount = (orderTotal * bestDiscount.percent) / 100;
    
    return {
      percent: bestDiscount.percent,
      amount: discountAmount,
      finalTotal: orderTotal - discountAmount,
      appliedRules: [bestDiscount.name]
    };
  }
  
  // Stackable discounts version
  static calculateStackableDiscounts(customer, orderTotal, products) {
    const discounts = this.getApplicableDiscounts(customer, orderTotal, products);
    
    let totalPercent = 0;
    const appliedRules = [];
    
    discounts.forEach(d => {
      totalPercent += d.percent;
      appliedRules.push(d.name);
    });
    
    // Cap at reasonable maximum
    totalPercent = Math.min(totalPercent, 50);
    
    const discountAmount = (orderTotal * totalPercent) / 100;
    
    return {
      percent: totalPercent,
      amount: discountAmount,
      finalTotal: orderTotal - discountAmount,
      appliedRules
    };
  }
}

export default DiscountService;