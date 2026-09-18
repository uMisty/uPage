import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { feedMiddleware } from './server/middleware'

export default defineConfig({
  plugins: [vue(), {
    name: 'upage-rss',
    configureServer(server) { server.middlewares.use(feedMiddleware(resolve('public'))) },
    configurePreviewServer(server) { server.middlewares.use(feedMiddleware(resolve('dist'))) },
  }],
})
