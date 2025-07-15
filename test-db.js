#!/usr/bin/env node

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

console.log("🔍 Testing Neon Database Connection...\n");

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.log("\nTo fix this:");
  console.log("1. Create a .env file in the project root");
  console.log("2. Add your Neon database URL:");
  console.log(
    "   DATABASE_URL=postgresql://username:password@host/database?sslmode=require"
  );
  console.log("\nOr get your Neon database URL from:");
  console.log("https://console.neon.tech/");
  process.exit(1);
}

console.log("✅ DATABASE_URL is set");
console.log(
  "🔗 Database URL format:",
  process.env.DATABASE_URL.substring(0, 20) + "..."
);

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

try {
  console.log("\n🔄 Attempting to connect to Neon database...");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Test the connection
  const client = await pool.connect();
  console.log("✅ Successfully connected to Neon database!");

  // Test a simple query
  const result = await client.query("SELECT NOW() as current_time");
  console.log("✅ Database query successful:", result.rows[0]);

  // Check if users table exists
  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    );
  `);

  if (tableCheck.rows[0].exists) {
    console.log("✅ Users table exists");

    // Check if there are any users
    const userCount = await client.query("SELECT COUNT(*) as count FROM users");
    console.log(`📊 Found ${userCount.rows[0].count} users in database`);
  } else {
    console.log(
      "⚠️  Users table does not exist - you may need to run migrations"
    );
  }

  client.release();
  await pool.end();

  console.log("\n🎉 Database connection test completed successfully!");
  console.log("\nIf you're still having login issues, check:");
  console.log("1. Neon console for any connection errors");
  console.log("2. IP allowlist in Neon settings");
  console.log("3. SSL mode requirements");
  console.log("4. Database URL format and credentials");
} catch (error) {
  console.error("\n❌ Database connection failed:", error.message);

  if (error.message.includes("ECONNREFUSED")) {
    console.log("\n🔧 Possible solutions:");
    console.log("1. Check if your Neon database is active");
    console.log("2. Verify the database URL is correct");
    console.log("3. Check Neon console for any maintenance");
  } else if (error.message.includes("authentication")) {
    console.log("\n🔧 Authentication failed:");
    console.log("1. Check username/password in DATABASE_URL");
    console.log("2. Verify database credentials in Neon console");
  } else if (error.message.includes("SSL")) {
    console.log("\n🔧 SSL connection issue:");
    console.log("1. Ensure DATABASE_URL includes ?sslmode=require");
    console.log("2. Check Neon SSL settings");
  } else if (error.message.includes("timeout")) {
    console.log("\n🔧 Connection timeout:");
    console.log("1. Check your internet connection");
    console.log("2. Verify Neon database is accessible");
    console.log("3. Check IP allowlist in Neon settings");
  }

  process.exit(1);
}
