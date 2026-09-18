<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { configSchema, type SiteConfig } from '../shared/config'
import ProfilePage from './components/ProfilePage.vue'
const config = shallowRef<SiteConfig>()
const error = ref('')
const loading = ref(true)

async function loadConfig() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('/site.config.json', { cache: 'no-store', signal: AbortSignal.timeout(10_000) })
    if (!response.ok) throw new Error('页面配置加载失败，请稍后重试。')
    const result = configSchema.safeParse(await response.json())
    if (!result.success) throw new Error(`页面配置有误：${result.error.issues.map(issue => `${issue.path.join('.')} — ${issue.message}`).join('；')}`)
    const parsed = result.data
    document.title = parsed.site.title
    document.documentElement.lang = parsed.site.lang
    document.querySelector('meta[name="description"]')?.setAttribute('content', parsed.site.description)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', parsed.theme.background)
    Object.entries(parsed.theme).forEach(([key, value]) => document.documentElement.style.setProperty(`--color-${key}`, value))
    config.value = parsed
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '页面加载失败，请稍后重试。' }
  finally { loading.value = false }
}
onMounted(loadConfig)
</script>

<template>
  <ProfilePage v-if="config" :config="config" />
  <main v-else class="app-state" aria-live="polite"><p class="eyebrow">uPage</p><template v-if="loading"><h1>稍等片刻。</h1><p>正在打开这个小小的个人空间。</p></template><template v-else><h1>页面暂时无法打开。</h1><p>{{ error }}</p><button class="button button-primary" @click="loadConfig">重新加载</button></template></main>
</template>
