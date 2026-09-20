import { defineConfig } from 'vite'
import { editorMiddleware } from './server/editor'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { feedMiddleware } from './server/middleware'

export default defineConfig(({ mode }) => ({
  plugins: [vue(), {
    name: 'upage-rss',
    configureServer(server) { if (mode === 'edit') server.middlewares.use(editorMiddleware(resolve('public')));  server.middlewares.use(feedMiddleware(resolve('public'))) },
    configurePreviewServer(server) { server.middlewares.use(feedMiddleware(resolve('dist'))) },
  }],
}))