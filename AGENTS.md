<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hemingway Bridges

After making major changes (i.e. a large commit) or concluding a session, you MUST create a "Hemingway bridge" markdown file in the gitignored `.hemingway/` directory (e.g., `.hemingway/bridge-<timestamp-or-desc>.md`).

This file serves to bridge the gap between sessions or agent invocations by documenting:
1. **What has been done**: A clear summary of the completed changes, files modified, and implemented features.
2. **What to do next**: A list of the very next steps, outstanding items, or planned tasks to resume work seamlessly.

Please ensure you write these to the `.hemingway/` folder so they are not committed to git.

