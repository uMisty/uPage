<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, provide, ref, watch } from 'vue'
import { builtinSections, pagesSchema, sectionKind, sectionLabel, type PageDocument, type SectionType, type SectionKind } from '../../shared/pages'
import { extraDefaults } from '../../shared/extra-sections'
import { markdownBlockSchema } from '../../shared/config'
import { pageEditingKey } from './pageEditing'
import ProfilePage from '../components/ProfilePage.vue'
import Fields from './Fields.vue'
import Icon from './EditorIcon.vue'
import ColorField from './ColorField.vue'
import './editor.css'
provide('editorPreview', true)
const document = ref<PageDocument>()
const selectedPage = ref(0)
const selected = ref<SectionType | 'settings'>('profile')
const tab = ref<'pages' | 'layers' | 'insert'>('layers')
const search = ref('')
const template = ref<any>()
const status = ref('正在加载…')
const saved = ref('')
const saving = ref(false)
const pendingText = ref(false)
const mobile = ref(false)
const imagePath = ref('')
const markdownEditing = ref('')
const textPath = ref('')
const textFallback = ref('#242822')
const dragged = ref<SectionType>()
const viewport = ref<HTMLElement>()
const page = computed(() => document.value?.pages[selectedPage.value])
const dirty = computed(() => pendingText.value || (!!document.value && JSON.stringify(document.value) !== saved.value))
const selectedIndex = computed(() => page.value?.layout.indexOf(selected.value as SectionType) ?? -1)
const selectedKind = computed(() => selected.value === 'settings' ? 'settings' : sectionKind(selected.value))
const fields = computed(() => ({ profile: ['profile'], projects: ['sections', 'projects'], writing: ['sections', 'blog', 'now'], tools: ['sections', 'toolGroups'], interests: ['sections', 'interests'], contact: ['contact'], footer: ['site'], settings: ['site', 'theme', 'labels'], markdown: [], timeline: ['timeline'], articles: ['articles'], gallery: ['gallery'], links: ['links'], faq: ['faq'] })[selectedKind.value])
const markdown = computed(() => page.value?.config.markdownBlocks?.[selected.value])
const theme = computed(() => Object.fromEntries(Object.entries(page.value?.config.theme ?? {}).map(([key, value]) => [`--color-${key}`, value])))
const descriptions: Record<SectionKind, string> = { profile: '姓名、介绍与首屏配图', projects: '展示作品与项目故事', writing: '博客文章与生活近况', tools: '你的日常创作工具', interests: '代码之外的热爱', contact: '开启下一次对话', footer: '版权信息与相关链接', markdown: '自由内容 · 可重复添加', timeline: '工作、学习与人生里程碑', articles: '手动精选文章与系列内容', gallery: '摄影、插画与生活切片', links: '朋友的博客与网站收藏', faq: '可展开的常见问答' }
const library: SectionKind[] = [...builtinSections, 'markdown']
function name(block: SectionType | 'markdown') { return block === 'markdown' ? 'Markdown' : sectionLabel(block, page.value?.config) }
const available = computed(() => library.filter(block => name(block).toLowerCase().includes(search.value.toLowerCase()) || descriptions[block].includes(search.value)))
function included(block: SectionKind) { return block !== 'markdown' && !!page.value?.layout.includes(block) }
function read(path: string): any { return path.split('.').reduce((value, key) => value?.[key], page.value?.config as any) }
function write(path: string, value: unknown) {
  const parts = path.split('.'); const key = parts.pop()!
  const parent = parts.reduce((item, part) => item?.[part], page.value?.config as any)
  if (parent && Object.prototype.hasOwnProperty.call(parent, key)) parent[key] = value
}
function choose(block: SectionType | 'settings', scroll = false) {
  selected.value = block; imagePath.value = ''; textPath.value = ''
  markdownEditing.value = block.startsWith('markdown-') ? block : ''
  if (scroll) nextTick(() => viewport.value?.querySelector(`[data-edit-section="${block}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
function selectText(path: string, color: string) {
  textPath.value = path
  const element = viewport.value?.querySelector<HTMLElement>(`[data-edit-text="${path}"]`)
  if (element) {
    const override = element.style.color
    element.style.removeProperty('color')
    color = getComputedStyle(element).color
    element.style.color = override
  }
  const rgb = color.match(/\d+/g)?.slice(0, 3)
  textFallback.value = rgb?.length === 3 ? `#${rgb.map(part => Number(part).toString(16).padStart(2, '0')).join('')}` : page.value!.config.theme.text
}
function setTextColor(color: string) {
  if (!page.value || !textPath.value) return
  const colors = page.value.config.textColors ??= {}
  if (color) colors[textPath.value] = color
  else delete colors[textPath.value]
}
provide(pageEditingKey, { read, write, select: block => choose(block), image: path => { imagePath.value = path }, pending: value => { pendingText.value = value }, text: selectText, selected: () => selected.value, markdownEditing: () => markdownEditing.value, editMarkdown: id => { markdownEditing.value = id } })
function canvasClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('a')) event.preventDefault()
  const section = target.closest<HTMLElement>('[data-edit-section]')?.dataset.editSection as SectionType | undefined
  if (section) choose(section)
  const text = target.closest<HTMLElement>('[data-edit-text]')
  if (text) selectText(text.dataset.editText!, getComputedStyle(text).color)
  if (target.closest('.article-row')) status.value = '博客文章来自 RSS 订阅，可在右侧修改订阅设置。'
}
function addPage() {
  if (!document.value || !page.value) return
  const id = `page-${Date.now()}`
  document.value.pages.push({ id, route: `/${id}/`, config: structuredClone(JSON.parse(JSON.stringify(page.value.config))), layout: [...page.value.layout] })
  selectedPage.value = document.value.pages.length - 1; selected.value = 'settings'; tab.value = 'pages'
}
function deletePage() {
  if (!page.value || page.value.route === '/') return
  if (!window.confirm('删除此页面？保存后生效。')) return
  document.value!.pages.splice(selectedPage.value, 1); selectedPage.value = 0
}
function move(index: number, offset: number) {
  const layout = page.value!.layout; const other = index + offset
  if (index < 0 || other < 0 || other >= layout.length) return
  ;[layout[index], layout[other]] = [layout[other], layout[index]]
}
function remove(block: SectionType) {
  page.value!.layout = page.value!.layout.filter(item => item !== block)
  if (sectionKind(block) === 'markdown') delete page.value!.config.markdownBlocks[block]
  if (selected.value === block) choose('settings')
}
function insert(block: SectionKind) {
  if (included(block)) return
  let id: SectionType
  if (block === 'markdown') {
    id = `markdown-${crypto.randomUUID()}`
    const blocks = page.value!.config.markdownBlocks ??= {}
    blocks[id] = markdownBlockSchema.parse({ name: `Markdown ${Object.keys(blocks).length + 1}` })
  } else id = block
  page.value!.layout.push(id); tab.value = 'layers'; choose(id, true)
}
function drop(block: SectionType) {
  if (!dragged.value || dragged.value === block) return
  const layout = page.value!.layout; const from = layout.indexOf(dragged.value); const to = layout.indexOf(block)
  if (from < 0 || to < 0) return
  layout.splice(from, 1); layout.splice(to, 0, dragged.value); dragged.value = undefined
}
async function save() {
  if (saving.value) return
  ;(window.document.activeElement as HTMLElement)?.blur()
  saving.value = true
  try {
    const parsed = pagesSchema.safeParse(document.value)
    if (!parsed.success) throw new Error(parsed.error.issues.map(issue => `${issue.path.join('.')}：${issue.message}`).join('\n'))
    const submittedState = JSON.stringify(document.value)
    const response = await fetch('/__edit/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Upage-Editor': '1' }, body: JSON.stringify(parsed.data) })
    const result = await response.json(); if (!response.ok) throw new Error(result.error)
    saved.value = submittedState; status.value = '已保存。运行 npm run build 生成静态网站。'
  } catch (reason) { status.value = reason instanceof Error ? reason.message : '保存失败' } finally { saving.value = false }
}
function leave(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
function shortcut(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save() } }
onMounted(async () => {
  window.addEventListener('beforeunload', leave); window.addEventListener('keydown', shortcut)
  try { const response = await fetch('/__edit/api/pages'); if (!response.ok) throw new Error('编辑数据读取失败'); document.value = pagesSchema.parse(await response.json()); template.value = await fetch('/site.config.json').then(response => response.json()); saved.value = JSON.stringify(document.value); status.value = '点击文字直接编辑 · Enter 完成 · Esc 取消' } catch (reason) { status.value = String(reason) }
})
onBeforeUnmount(() => { window.removeEventListener('beforeunload', leave); window.removeEventListener('keydown', shortcut) })
watch(selectedPage, () => { choose('settings'); viewport.value?.parentElement?.scrollTo(0, 0) })
</script>
<template>
  <div class="editor-shell">
    <header class="editor-toolbar">
      <div class="editor-brand"><span class="editor-logo">u.</span><strong>uPage<span>STUDIO</span></strong><span class="editor-divider" /><span class="workspace-label">我的网站</span></div>
      <div class="toolbar-center"><span class="live-dot" /> 本地编辑空间</div>
      <div class="toolbar-actions"><span class="save-state" :class="{ dirty }"><Icon :name="dirty ? 'cursor' : 'check'" />{{ dirty ? '未保存' : '已保存' }}</span><button :disabled="!document || saving" class="save-button" @click="save">{{ saving ? '保存中…' : '保存全部页面' }}<span aria-hidden="true">⌘ / Ctrl S</span></button></div>
    </header>
    <div v-if="page && document" class="editor-workspace">
      <aside class="editor-sidebar">
        <div class="sidebar-heading"><span class="panel-kicker">WORKSPACE</span><h2>搭建你的页面</h2></div>
        <nav class="sidebar-tabs" aria-label="编辑工具"><button :aria-pressed="tab === 'pages'" @click="tab = 'pages'"><Icon name="pages" />页面</button><button :aria-pressed="tab === 'layers'" @click="tab = 'layers'"><Icon name="layers" />图层</button><button :aria-pressed="tab === 'insert'" @click="tab = 'insert'"><Icon name="plus" />添加</button></nav>
        <div class="sidebar-content">
          <template v-if="tab === 'pages'"><div class="panel-label">站点页面 <span>{{ document.pages.length }}</span></div><button v-for="(item, index) in document.pages" :key="item.id" class="page-item" :class="{ active: selectedPage === index }" @click="selectedPage = index; choose('settings')"><Icon name="pages" /><span><strong>{{ item.config.site.title }}</strong><small>{{ item.route }}</small></span><span v-if="selectedPage === index" class="current-dot" /></button><button class="add-page-button" @click="addPage"><Icon name="plus" />新建页面</button><button class="delete-page-button" :disabled="page.route === '/'" @click="deletePage">删除当前页面</button></template>
          <template v-else-if="tab === 'layers'">
            <label class="page-picker"><Icon name="pages" /><select v-model="selectedPage" aria-label="选择页面"><option v-for="(item, index) in document.pages" :key="item.id" :value="index">{{ item.config.site.title }}</option></select></label>
            <div class="panel-label">页面结构 <span>{{ page.layout.length }} 个模块</span></div>
            <div class="block-list"><div v-for="(block, index) in page.layout" :key="block" class="block-row" :class="{ active: selected === block, dragging: dragged === block }" @dragover.prevent @drop.prevent="drop(block)"><button class="drag-handle" draggable="true" :aria-label="`拖动${name(block)}`" @dragstart="dragged = block; $event.dataTransfer?.setData('text/plain', block)" @dragend="dragged = undefined"><Icon name="grip" /></button><button class="block-name" @click="choose(block, true)"><span class="block-icon"><Icon :name="block.startsWith('markdown-') ? 'markdown' : block" /></span><span>{{ name(block) }}</span></button><div class="block-actions"><button :disabled="index === 0" :aria-label="`上移${name(block)}`" @click="move(index, -1)"><Icon name="arrowUp" /></button><button :disabled="index === page.layout.length - 1" :aria-label="`下移${name(block)}`" @click="move(index, 1)"><Icon name="arrowDown" /></button></div></div></div>
            <button class="add-block-button" @click="tab = 'insert'"><Icon name="plus" />添加模块</button>
            <button class="settings-button" :aria-pressed="selected === 'settings'" @click="choose('settings')"><Icon name="settings" />页面设置与访问路由</button>
          </template>
          <template v-else><div class="panel-label">模块库 <span>{{ library.length }} 种模块</span></div><label class="block-search"><Icon name="search" /><input v-model="search" aria-label="搜索模块" placeholder="搜索模块…" /></label><div class="insert-grid"><button v-for="block in available" :key="block" class="insert-card" :disabled="included(block)" :aria-label="`添加${name(block)}`" @click="insert(block)"><span class="insert-art" :class="`art-${block}`"><Icon :name="block.startsWith('markdown-') ? 'markdown' : block" /></span><strong>{{ name(block) }}</strong><small>{{ included(block) ? '已在页面中' : descriptions[block] }}</small><Icon :name="included(block) ? 'check' : 'plus'" /></button></div><p v-if="!available.length" class="editor-hint">没有找到匹配的模块。</p></template>
        </div>
        <div class="sidebar-tip"><span class="tip-icon"><Icon name="cursor" /></span><div><strong>所见，即可编辑</strong><p>点击画布文字修改内容<br />点击图片替换素材</p></div></div>
      </aside>
      <main class="editor-canvas">
        <div class="preview-toolbar"><span class="canvas-breadcrumb"><Icon name="pages" />{{ page.route }}<span>/</span><strong>编辑画布</strong></span><div class="device-switch" aria-label="画布宽度"><button :aria-pressed="!mobile" aria-label="桌面画布" @click="mobile = false"><Icon name="desktop" /></button><button :aria-pressed="mobile" aria-label="窄屏画布" @click="mobile = true"><Icon name="mobile" /></button></div></div>
        <div class="canvas-context"><span><Icon :name="selectedKind" />{{ selected === 'settings' ? '页面设置' : name(selected) }}</span><div v-if="selectedIndex >= 0"><button :disabled="selectedIndex === 0" aria-label="上移当前模块" @click="move(selectedIndex, -1)"><Icon name="arrowUp" /></button><button :disabled="selectedIndex === page.layout.length - 1" aria-label="下移当前模块" @click="move(selectedIndex, 1)"><Icon name="arrowDown" /></button><span class="editor-divider" /><button aria-label="移除当前模块" @click="remove(selected as SectionType)"><Icon name="close" /></button></div><small v-else>标题、路由与全局样式</small></div>
        <div ref="viewport" class="preview-viewport" :class="{ narrow: mobile }" :data-selected="selected" :style="theme" @click.capture="canvasClick"><ProfilePage :key="page.id + JSON.stringify(page.config.blog)" :config="page.config" :layout="page.layout" /></div>
        <button v-if="!page.layout.length" class="empty-canvas" @click="tab = 'insert'">＋ 添加第一个模块</button>
      </main>
      <aside class="editor-inspector"><div class="inspector-heading"><span class="panel-kicker">{{ imagePath ? 'IMAGE' : selected === 'settings' ? 'PAGE SETTINGS' : 'BLOCK SETTINGS' }}</span><h2><Icon :name="imagePath ? 'image' : selectedKind" />{{ imagePath ? '替换图片' : selected === 'settings' ? '页面设置' : name(selected) }}</h2><p>{{ imagePath ? '上传图片、粘贴图片地址，工具图标还可从图标库选择。' : selected === 'settings' ? '让每个页面都有自己的地址。' : '文字可在画布直接编辑，更多选项在这里。' }}</p></div><div class="inspector-content">
        <template v-if="imagePath"><button class="back-to-block" @click="imagePath = ''">← 返回模块设置</button><Fields :label="imagePath.endsWith('.icon') ? 'icon' : 'image'" :path="imagePath" :model-value="read(imagePath)" @update:model-value="write(imagePath, $event)" /><Fields v-if="imagePath.endsWith('.image')" label="imageAlt" :model-value="read(`${imagePath}Alt`)" @update:model-value="write(`${imagePath}Alt`, $event)" /></template>
        <template v-else>
          <div v-if="textPath" class="text-color-card"><div class="panel-label">选中文字 <button type="button" aria-label="关闭文字颜色" @click="textPath = ''">×</button></div><p class="selected-text-preview">{{ read(textPath) }}</p><ColorField :key="textPath" label="文字颜色" :model-value="page.config.textColors?.[textPath] || ''" :fallback="textFallback" allow-reset @update:model-value="setTextColor" /><small>只改变这段文字，其他内容保持原来的配色。</small></div>
          <div v-if="selectedKind === 'markdown' && markdown" class="markdown-editor"><label class="value-field"><span>模块名称</span><input v-model="markdown.name" /></label><div class="markdown-help"><strong>Markdown</strong><span>支持标题、列表、链接、图片、表格和代码块</span></div><button type="button" class="open-markdown-editor" @click="choose(selected, true)">在画布编辑 Markdown</button><p class="editor-hint">在画布内编辑源码，使用顶部“预览 Markdown”查看效果。原始 HTML 作为文字显示。</p><ColorField label="模块文字颜色" v-model="markdown.textColor" :fallback="page.config.theme.text" allow-reset /><ColorField label="模块背景颜色" v-model="markdown.background" :fallback="page.config.theme.background" allow-reset /></div>
          <label v-if="selected === 'settings'" class="value-field route-field"><span>访问路由（例如 /about/）</span><input v-model="page.route" /><small>首页保留 /，支持 /work/demo/ 等嵌套路径。</small></label><template v-for="key in fields" :key="key"><Fields v-if="key !== 'sections'" :label="key" :path="key" :model-value="(page.config as any)[key]" :seed="template?.[key] ?? (extraDefaults as any)[key]" @update:model-value="(page!.config as any)[key] = $event" /><Fields v-else :label="'栏目标题'" :model-value="(page.config.sections as any)[selected]" :seed="template?.sections[selected]" @update:model-value="(page!.config.sections as any)[selected] = $event" /></template></template>
      </div></aside>
    </div>
    <footer class="editor-status" role="status"><span class="status-dot" />{{ status }}<span class="status-end">uPage Studio · 静态网站编辑器</span></footer>
  </div>
</template>
