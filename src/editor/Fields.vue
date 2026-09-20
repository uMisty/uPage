<script setup lang="ts">
import { computed, ref } from 'vue'
import { projectSchema } from '../../shared/config'
import ColorField from './ColorField.vue'
import ToolIconField from './ToolIconField.vue'
const props = defineProps<{ modelValue: any; label: string; seed?: any; path?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()
const error = ref('')
const busy = ref(false)
const defaults: Record<string, any> = {
  projects: projectSchema.parse({ name: '新项目', description: '' }),
  interests: { name: '新兴趣', description: '', image: '', imageAlt: '' },
  toolGroups: { name: '新分类', items: [{ name: '新工具', purpose: '', icon: '', mark: '', url: '' }] },
  items: { label: '新条目', text: '' },
}
const names: Record<string, string> = { timeline: '经历时间线', articles: '精选文章', gallery: '相册画廊', links: '友链收藏', faq: '常见问题', period: '时间段', organization: '组织或身份', date: '日期', category: '分类', question: '问题', answer: '回答', site: '页面信息与页脚', theme: '配色', labels: '按钮与状态文案', profile: '个人介绍', sections: '栏目标题', projects: '项目', blog: '博客订阅', now: '近况', toolGroups: '工具分类', interests: '兴趣', contact: '联系', eyebrow: '眉题', name: '名称', title: '标题', description: '介绍', image: '图片', imageAlt: '图片替代文字', icon: '图标', headline: '主标题', headlineLines: '移动端标题分行', bio: '简介段落', motto: '座右铭', suffix: '姓名后缀', blogLabel: '博客按钮文字', projectsLabel: '项目按钮文字', moreLabel: '更多链接文字', moreUrl: '更多链接地址', enabled: '启用', url: '链接', feedUrl: 'RSS 地址', limit: '文章数量', cacheMinutes: '刷新间隔（分钟）', showReadingTime: '显示阅读时间', defaultCategory: '默认分类', updatedLabel: '更新时间文字', items: '条目', label: '标签', text: '内容', purpose: '用途', mark: '图标替代文字', email: '邮箱', mobileTitle: '移动端标题', mobileDescription: '移动端介绍', tags: '标签', summary: '摘要', background: '背景色', demoUrl: '演示地址', githubUrl: '源码地址', releasedAt: '发布日期', featured: '主推项目', releaseLabel: '主推标签', footer: '页脚文字', footerLabel: '页脚链接文字', footerUrl: '页脚链接', lang: '语言', accent: '强调色', muted: '辅助文字色', line: '分隔线颜色', dark: '深色背景', soft: '浅色背景' }
const title = computed(() => props.path === 'theme.text' ? '正文文字色' : names[props.label] || props.label)
const isColor = computed(() => props.path?.startsWith('theme.') || props.label === 'background')
const isImage = computed(() => ['image', 'icon'].includes(props.label))
const isToolIcon = computed(() => /^toolGroups\.\d+\.items\.\d+\.icon$/.test(props.path ?? ''))
function set(key: string | number, value: any) { const copy = Array.isArray(props.modelValue) ? [...props.modelValue] : { ...props.modelValue }; copy[key as any] = value; emit('update:modelValue', copy) }
function add() { const sample = props.seed?.[0] ?? props.modelValue[0] ?? defaults[props.label] ?? ''; emit('update:modelValue', [...props.modelValue, JSON.parse(JSON.stringify(sample))]) }
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return
  busy.value = true; error.value = ''
  try {
    const response = await fetch('/__edit/api/upload', { method: 'POST', headers: { 'Content-Type': file.type, 'X-Upage-Editor': '1' }, body: file })
    const result = await response.json(); if (!response.ok) throw new Error(result.error)
    emit('update:modelValue', result.url)
  } catch (reason) { error.value = String(reason) } finally { busy.value = false }
}
</script>
<template>
  <fieldset v-if="Array.isArray(modelValue)" class="field-group"><legend>{{ title }}</legend>
    <div v-for="(item, index) in modelValue" :key="index" class="array-item"><Fields :model-value="item" :path="`${path || label}.${index}`" :seed="seed?.[index] ?? seed?.[0] ?? defaults[label]" :label="`${title} ${index + 1}`" @update:model-value="set(index, $event)" /><div class="field-actions"><button type="button" :disabled="index === 0" @click="emit('update:modelValue', modelValue.toSpliced(index - 1, 2, item, modelValue[index - 1]))">上移</button><button type="button" @click="emit('update:modelValue', modelValue.filter((_: any, i: number) => i !== index))">删除条目</button></div></div>
    <button type="button" @click="add">＋ 添加条目</button>
  </fieldset>
  <fieldset v-else-if="modelValue !== null && typeof modelValue === 'object'" class="field-group"><legend>{{ title }}</legend><template v-for="(value, key) in modelValue" :key="key"><Fields v-if="!['version', 'mode'].includes(String(key))" :label="String(key)" :model-value="value" :path="`${path || label}.${String(key)}`" :seed="seed?.[key]" @update:model-value="set(String(key), $event)" /></template></fieldset>
  <label v-else-if="typeof modelValue === 'boolean'" class="check-field"><input type="checkbox" :checked="modelValue" @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)" />{{ title }}</label>
  <ColorField v-else-if="isColor" :label="title" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
  <ToolIconField v-else-if="isToolIcon" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"><Fields label="icon" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" /></ToolIconField>
  <label v-else class="value-field"><span>{{ title }}</span><input v-if="typeof modelValue === 'number'" type="number" :value="modelValue" @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))" /><textarea v-else :aria-label="title" :value="modelValue" rows="2" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" /><template v-if="isImage"><img v-if="modelValue" :src="modelValue" alt="素材预览" class="asset-preview" /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" :disabled="busy" @change="upload" /><small>{{ busy ? '正在上传…' : '填写图片地址，或上传图片（最大 12 MB）' }}</small><span v-if="error" role="alert">{{ error }}</span></template></label>
</template>
