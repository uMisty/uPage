import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

if (import.meta.env.MODE === 'edit' && location.pathname.startsWith('/__edit')) {
  import('./editor/Editor.vue').then(({ default: Editor }) => createApp(Editor).mount('#app'))
} else createApp(App).mount('#app')
