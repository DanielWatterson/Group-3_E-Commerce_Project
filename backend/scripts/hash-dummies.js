// backend/scripts/hash-passwords.js
import { pool } from "../config/config.js";
import { hash } from "bcrypt";
import { config } from "dotenv";

config();

async function hashExistingPasswords() {
    try {
        console.log("🔐 Starting password hashing process...");
        
        // Get all customers with their plain text passwords
        const [customers] = await pool.query(
            "SELECT customer_id, email, password FROM customer"
        );
        
        console.log(`📊 Found ${customers.length} customers to process`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const customer of customers) {
            // Check if password is already hashed (starts with $2b$)
            if (customer.password.startsWith('$2b$')) {
                console.log(`⏭️  Customer ${customer.email} already hashed, skipping`);
                skipped++;
                continue;
            }
            
            // Hash the plain text password using your existing hash function
            const hashedPassword = await hash(customer.password, 11);
            
            // Update the database
            await pool.query(
                "UPDATE customer SET password = ? WHERE customer_id = ?",
                [hashedPassword, customer.customer_id]
            );
            
            console.log(`✅ Customer ${customer.email} password hashed`);
            updated++;
        }
        
        console.log("\n🎉 Hashing complete!");
        console.log(`✅ Updated: ${updated} customers`);
        console.log(`⏭️  Skipped: ${skipped} customers (already hashed)`);
        
        // Show sample of what changed
        const [sample] = await pool.query(
            "SELECT email, password FROM customer LIMIT 1"
        );
        console.log("\n📝 Sample hashed password:");
        console.log(`Email: ${sample[0].email}`);
        console.log(`Hash: ${sample[0].password.substring(0, 30)}...`);
        
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error hashing passwords:", error);
        process.exit(1);
    }
}

hashExistingPasswords();