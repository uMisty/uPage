<script setup lang="ts">
defineProps<{ name: string }>()
const paths: Record<string, string> = {
  timeline: 'M6 3v18M3 6h6m-6 6h6m-6 6h6M12 6h9m-9 6h7m-7 6h9', articles: 'M4 3h12v18H4V3Zm12 4h4v14h-4M7 7h6M7 11h6M7 15h6', gallery: 'M3 3h18v18H3V3Zm0 14 6-6 4 4 3-3 5 5M15 7h.01', links: 'm10 8 3-3a4 4 0 0 1 6 6l-3 3M8 10l-3 3a4 4 0 0 0 6 6l3-3M8 16l8-8', faq: 'M3 3h18v15H9l-6 3V3Zm6 5a3 3 0 1 1 5 2l-2 1v1m0 3h.01',
  markdown: 'M2 5h20v14H2V5Zm3 10V9l3 3 3-3v6M17 9v6m-2-2 2 2 2-2',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  pages: 'M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h5',
  plus: 'M12 5v14M5 12h14',
  settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  profile: 'M4 4h16v16H4V4Zm3 4h5M7 12h5M7 16h10M16 8h1',
  projects: 'M3 6h7l2 2h9v12H3V6Zm0 0V4h7l2 2h7v2',
  writing: 'M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h4',
  tools: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  interests: 'm12 3 2.8 5.7L21 9.6l-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  contact: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
  footer: 'M4 4h16v16H4V4Zm0 11h16M8 18h8',
  desktop: 'M3 4h18v13H3V4Zm9 13v4M8 21h8',
  mobile: 'M7 2h10v20H7V2Zm4 17h2',
  arrowUp: 'm6 14 6-6 6 6', arrowDown: 'm6 10 6 6 6-6',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  search: 'M15 15l6 6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  image: 'M3 3h18v18H3V3Zm0 14 6-6 4 4 3-3 5 5M15 7h.01',
  cursor: 'm5 3 14 9-7 1-3 7L5 3Z',
}
</script>
<template><svg class="editor-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.layers" /></svg></template>
