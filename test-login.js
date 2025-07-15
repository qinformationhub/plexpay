#!/usr/bin/env node

import "dotenv/config";

console.log("🔍 Testing Login API...\n");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function testLogin() {
  try {
    console.log(`🌐 Testing login at: ${baseUrl}/api/auth/login`);

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "password123",
      }),
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(
      `📋 Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    const contentType = response.headers.get("content-type");
    console.log(`📄 Content-Type: ${contentType}`);

    if (contentType && contentType.includes("text/html")) {
      console.log("❌ ERROR: Received HTML instead of JSON!");
      console.log(
        "This means the API route is being intercepted by the static file server."
      );
      const text = await response.text();
      console.log(
        "📄 Response body (first 200 chars):",
        text.substring(0, 200)
      );
    } else {
      const data = await response.json();
      console.log("✅ SUCCESS: Received JSON response!");
      console.log("📄 Response data:", data);
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
}

// Test both admin and staff users
async function testAllUsers() {
  const users = [
    { username: "admin", password: "password123" },
    { username: "staff", password: "password123" },
  ];

  for (const user of users) {
    console.log(`\n🔐 Testing login for user: ${user.username}`);
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("text/html")) {
        console.log("❌ ERROR: Received HTML instead of JSON!");
      } else {
        const data = await response.json();
        if (response.ok) {
          console.log(`✅ Login successful for ${user.username}:`, data);
        } else {
          console.log(`❌ Login failed for ${user.username}:`, data);
        }
      }
    } catch (error) {
      console.error(`❌ Request failed for ${user.username}:`, error.message);
    }
  }
}

// Run tests
console.log("🚀 Starting login tests...\n");
testLogin().then(() => {
  console.log("\n" + "=".repeat(50));
  testAllUsers();
});
