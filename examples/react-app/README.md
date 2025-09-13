# d-query React Example

This example demonstrates using `d-query-react` in a small Vite app within the monorepo workspace.

## Quick start (pnpm workspace)

From the repo root:

```bash
# install workspace deps (links local packages)
pnpm install

# build packages (optional - the example can use workspace packages without build depending on setup)
pnpm run build

# run the example dev server
pnpm --filter d-query-react-example run dev
```

Open http://localhost:5173

Notes:
- The example depends on `d-query-react` via the workspace protocol, so the local packages are linked automatically by pnpm.
- If you make changes to packages, rebuild them with `pnpm -w -r run build` or rely on Vite + workspace linking during dev.
