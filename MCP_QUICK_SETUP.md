# Quick Setup: Supabase MCP Server

## 🚀 Quick Steps

### 1. Get Token
Visit: https://supabase.com/dashboard/account/tokens
- Click "Generate new token"
- Copy token (starts with `sbp_...`)

### 2. Test Token (Optional)
```bash
SUPABASE_ACCESS_TOKEN=sbp_YOUR_TOKEN node scripts/test-supabase-mcp.js
```

### 3. Configure Cursor

**Open Cursor Settings JSON:**
- Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
- Type: `Preferences: Open User Settings (JSON)`
- Press Enter

**Add this configuration:**

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

**Replace `sbp_YOUR_TOKEN_HERE` with your actual token!**

### 4. Restart Cursor
- Quit completely (`Cmd + Q` on macOS)
- Reopen Cursor

### 5. Verify
Ask the AI: "Check Supabase database logs"

---

## 📋 Your Project Details

- **Project ID**: `nqdznclpnizsyjxbxgxo`
- **Project URL**: `https://nqdznclpnizsyjxbxgxo.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/nqdznclpnizsyjxbxgxo

---

## ❓ Troubleshooting

**"Project not found" error?**
- ✅ Check token starts with `sbp_`
- ✅ Check project ref is `nqdznclpnizsyjxbxgxo`
- ✅ Fully restart Cursor (not just reload window)
- ✅ Generate a new token if needed

**Need more help?**
See `MCP_SUPABASE_SETUP.md` for detailed instructions.


