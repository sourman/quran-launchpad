#!/usr/bin/env node

/**
 * Test script to verify Supabase MCP server configuration
 * 
 * This script helps verify that your Supabase access token and project
 * reference are correct before configuring the MCP server in Cursor.
 * 
 * Usage:
 *   node scripts/test-supabase-mcp.js
 * 
 * Or with environment variables:
 *   SUPABASE_ACCESS_TOKEN=sbp_... SUPABASE_PROJECT_REF=nqdznclpnizsyjxbxgxo node scripts/test-supabase-mcp.js
 */

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'nqdznclpnizsyjxbxgxo';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is not set');
  console.log('\nTo test the connection:');
  console.log('1. Get your token from: https://supabase.com/dashboard/account/tokens');
  console.log('2. Run: SUPABASE_ACCESS_TOKEN=sbp_YOUR_TOKEN node scripts/test-supabase-mcp.js');
  process.exit(1);
}

if (!SUPABASE_ACCESS_TOKEN.startsWith('sbp_')) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN should start with "sbp_"');
  process.exit(1);
}

console.log('🔍 Testing Supabase MCP connection...\n');
console.log(`Project Reference: ${SUPABASE_PROJECT_REF}`);
console.log(`Token: ${SUPABASE_ACCESS_TOKEN.substring(0, 10)}...\n`);

// Test API connection
async function testConnection() {
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Connection failed: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      if (response.status === 401) {
        console.error('\n💡 The access token is invalid or expired.');
        console.error('   Generate a new token at: https://supabase.com/dashboard/account/tokens');
      } else if (response.status === 404) {
        console.error('\n💡 Project not found. Check that the project reference is correct.');
        console.error(`   Current project ref: ${SUPABASE_PROJECT_REF}`);
      }
      
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ Connection successful!');
    console.log(`\nProject Details:`);
    console.log(`  Name: ${data.name || 'N/A'}`);
    console.log(`  ID: ${data.id || SUPABASE_PROJECT_REF}`);
    console.log(`  Region: ${data.region || 'N/A'}`);
    console.log(`  Organization ID: ${data.organization_id || 'N/A'}`);
    console.log('\n🎉 Your Supabase MCP server should work with these credentials!');
    console.log('\nNext steps:');
    console.log('1. Follow the instructions in MCP_SUPABASE_SETUP.md');
    console.log('2. Add these credentials to Cursor MCP configuration');
    console.log('3. Restart Cursor');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Network connectivity problem');
    console.error('  - Invalid access token');
    console.error('  - Incorrect project reference');
    process.exit(1);
  }
}

testConnection();


