<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ToolIcon from '../components/ToolIcon.vue'
import { getToolIcon, toolIconNames } from '../../shared/tool-icons'
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const query = ref('')
const collection = ref('')
const limit = ref(60)
const library = computed(() => Boolean(getToolIcon(props.modelValue)))
const matches = computed(() => toolIconNames.filter(name => (!collection.value || name.startsWith(`${collection.value}:`)) && name.includes(query.value.trim().toLowerCase())))
watch([query, collection], () => { limit.value = 60 })
</script>
<template>
  <div class="tool-icon-field">
    <label class="value-field"><span>图标来源</span><select :value="library ? 'library' : 'image'" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value === 'library' ? 'lucide:wrench' : '')"><option value="image">图片 / 替代文字</option><option value="library">Iconify 图标库</option></select></label>
    <template v-if="library">
      <div class="icon-current"><ToolIcon :name="modelValue" /><code>{{ modelValue }}</code></div>
      <label class="value-field"><span>图标集合</span><select v-model="collection"><option value="">全部图标</option><option value="lucide">Lucide · 通用图标</option><option value="simple-icons">Simple Icons · 品牌图标</option></select></label>
      <label class="value-field"><span>搜索图标</span><input v-model="query" type="search" placeholder="输入英文名称，如 vue、github、code" /></label>
      <small aria-live="polite">找到 {{ matches.length }} 个图标</small>
      <div class="icon-picker-grid" aria-label="选择工具图标"><button v-for="name in matches.slice(0, limit)" :key="name" type="button" :title="name" :aria-label="name" :aria-pressed="modelValue === name" @click="emit('update:modelValue', name)"><ToolIcon :name="name" /></button></div>
      <p v-if="!matches.length">没有匹配的图标，请尝试其他英文名称。</p>
      <button v-if="matches.length > limit" type="button" @click="limit += 60">显示更多图标</button>
      <small>图标随网站打包，无需在线加载。切换来源后可重新选择图片或图标。</small>
    </template>
    <slot v-else />
  </div>
</template>
<style scoped>
.tool-icon-field { display: grid; gap: 12px; min-width: 0; }
.tool-icon-field select, .tool-icon-field input { width: 100%; padding: 9px; border: 1px solid #dce1ea; border-radius: 8px; background: #fff; color: #243047; }
.icon-current { display: flex; align-items: center; gap: 10px; padding: 12px; background: #f1f5ff; border-radius: 10px; color: #345acf; }
.icon-current code { overflow-wrap: anywhere; font-size: 11px; min-width: 0; }
.icon-current svg { flex-shrink: 0; }
.icon-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(38px, 1fr)); gap: 6px; max-height: 260px; overflow-y: auto; padding: 3px; }
.icon-picker-grid button { display: grid; place-items: center; min-height: 38px; padding: 6px; border: 1px solid #e0e5ef; border-radius: 8px; background: #fff; color: #334155; cursor: pointer; }
.icon-picker-grid button:hover, .icon-picker-grid button[aria-pressed="true"] { background: #eaf0ff; border-color: #486ae8; color: #294ac4; }
.icon-picker-grid button:focus-visible { outline: 2px solid #486ae8; outline-offset: 1px; }
.tool-icon-field small { color: #637087; line-height: 1.6; }
</style>
