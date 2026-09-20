import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/editor', workers: 1,
  use: { baseURL: 'http://127.0.0.1:5182', channel: 'msedge' },
  webServer: { command: 'pnpm exec vite --mode edit --host 127.0.0.1 --port 5182 --strictPort', url: 'http://127.0.0.1:5182', reuseExistingServer: false },
})
