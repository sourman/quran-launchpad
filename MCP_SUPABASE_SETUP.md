# Supabase MCP Server Configuration Guide

This guide will help you configure the Supabase MCP (Model Context Protocol) server in Cursor so you can access database logs and other Supabase features directly from the AI assistant.

## Prerequisites

- Cursor IDE installed
- Supabase account with access to project `nqdznclpnizsyjxbxgxo`

## Step 1: Get Your Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a descriptive name (e.g., "Cursor MCP Server")
4. Copy the token (it starts with `sbp_...`)
   - ⚠️ **Important**: Save this token securely - you won't be able to see it again!

### Optional: Test Your Token First

Before configuring Cursor, you can test that your token works:

```bash
# Get your token from the Supabase dashboard first, then:
SUPABASE_ACCESS_TOKEN=sbp_YOUR_TOKEN_HERE node scripts/test-supabase-mcp.js
```

This will verify that your token and project reference are correct.

## Step 2: Configure MCP Server in Cursor

### Option A: Using Cursor Settings UI

1. Open Cursor Settings:
   - **macOS**: `Cmd + ,` or `Cursor → Settings`
   - **Windows/Linux**: `Ctrl + ,` or `File → Preferences → Settings`

2. Search for "MCP" or "Model Context Protocol" in settings

3. Look for "Supabase" MCP server configuration

4. Add or update the configuration with:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "sbp_YOUR_TOKEN_HERE",
           "SUPABASE_PROJECT_REF": "nqdznclpnizsyjxbxgxo"
         }
       }
     }
   }
   ```

### Option B: Using Cursor Settings JSON

1. Open Cursor Settings JSON:
   - Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
   - Type "Preferences: Open User Settings (JSON)"
   - Press Enter

2. Add or update the MCP configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_YOUR_TOKEN_HERE",
        "SUPABASE_PROJECT_REF": "nqdznclpnizsyjxbxgxo"
      }
    }
  }
}
```

**Replace `sbp_YOUR_TOKEN_HERE` with your actual token from Step 1.**

### Option C: Using Cursor Config File

If Cursor uses a config file (typically `~/.cursor/mcp.json` or similar):

1. Create or edit the MCP configuration file
2. Add the Supabase server configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_YOUR_TOKEN_HERE",
        "SUPABASE_PROJECT_REF": "nqdznclpnizsyjxbxgxo"
      }
    }
  }
}
```

## Step 3: Restart Cursor

After configuring the MCP server:

1. **Completely quit Cursor** (not just close the window)
   - **macOS**: `Cmd + Q` or `Cursor → Quit Cursor`
   - **Windows/Linux**: Close all windows and ensure the process is terminated

2. **Reopen Cursor** to load the new MCP configuration

## Step 4: Verify Connection

After restarting, you can verify the connection by asking the AI assistant:

- "Check Supabase database logs"
- "List Supabase tables"
- "Get Supabase advisors"

If the connection is working, you should get results. If you still see "Project not found" errors, check:

1. ✅ Token is correct (starts with `sbp_`)
2. ✅ Project reference is correct: `nqdznclpnizsyjxbxgxo`
3. ✅ Cursor was fully restarted
4. ✅ Token has not expired (generate a new one if needed)

## Troubleshooting

### "Project not found" Error

- **Check token**: Make sure you copied the full token (it's long)
- **Check project ref**: Verify it's `nqdznclpnizsyjxbxgxo` (from `supabase/config.toml`)
- **Regenerate token**: Sometimes tokens expire or are invalidated

### MCP Server Not Loading

- **Check Node.js**: Ensure Node.js is installed (`node --version`)
- **Check npx**: Try running `npx -y @supabase/mcp-server-supabase` in terminal
- **Check Cursor logs**: Look for MCP-related errors in Cursor's developer console

### Permission Issues

- **Token permissions**: Make sure the token has access to your project
- **Project access**: Verify you have access to project `nqdznclpnizsyjxbxgxo` in Supabase dashboard

## Alternative: Manual Database Log Check

If MCP configuration doesn't work, you can always check logs manually:

1. Go to: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo/logs/explorer
2. Select "Postgres Logs" from the service dropdown
3. Review recent logs for errors or warnings

## Security Notes

- ⚠️ **Never commit your access token to git**
- ⚠️ **Keep your token secure** - it provides full access to your Supabase project
- ⚠️ **Rotate tokens regularly** for security best practices
- ✅ The token is stored locally in Cursor settings, not in your project files

## Next Steps

Once configured, you can use the AI assistant to:
- ✅ Check database logs for errors
- ✅ Query database tables
- ✅ Run migrations
- ✅ Check security advisors
- ✅ Manage Edge Functions
- ✅ And much more!

---

**Project Details:**
- **Project ID**: `nqdznclpnizsyjxbxgxo`
- **Project URL**: `https://nqdznclpnizsyjxbxgxo.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo

