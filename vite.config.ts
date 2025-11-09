import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Inject worktree name into HTML title
    {
      name: 'inject-worktree-title',
      transformIndexHtml(html) {
        const worktree = process.env.VITE_WORKTREE;
        if (worktree) {
          return html.replace(
            /<title>(.*?)<\/title>/,
            `<title>[${worktree}] $1</title>`
          );
        }
        return html;
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
