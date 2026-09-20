<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import type { SiteConfig } from '../../shared/config'
import { renderMarkdown } from '../../shared/markdown'
import { pageEditingKey, usePageEditing } from '../editor/pageEditing'
const props = defineProps<{ id: `markdown-${string}`; block: SiteConfig['markdownBlocks'][string] }>()
const { vSection } = usePageEditing()
const html = computed(() => renderMarkdown(props.block.content))
const editor = inject(pageEditingKey, undefined)
const source = ref<HTMLTextAreaElement>()
const editing = computed(() => editor?.markdownEditing() === props.id)
const selected = computed(() => editor?.selected() === props.id)
function update(value: string) { editor?.write(`markdownBlocks.${props.id}.content`, value) }
function insert(before: string, after = '', placeholder = '文字') {
  const start = source.value?.selectionStart ?? props.block.content.length
  const end = source.value?.selectionEnd ?? start
  const content = props.block.content
  const text = content.slice(start, end) || placeholder
  update(content.slice(0, start) + before + text + after + content.slice(end))
  nextTick(() => { source.value?.focus(); source.value?.setSelectionRange(start + before.length, start + before.length + text.length) })
}
watch(editing, value => { if (value) nextTick(() => source.value?.focus()) }, { immediate: true })
</script>
<template>
  <section v-section="id" class="markdown-section section" :class="{ 'markdown-is-editing': editing }" :aria-label="block.name" :style="{ color: block.textColor || undefined, background: block.background || undefined }">
    <div v-if="editor && selected" class="markdown-canvas-toolbar">
      <strong>Markdown</strong><div class="markdown-mode-switch"><button type="button" :aria-pressed="editing" @click="editor.editMarkdown(id)">编辑 Markdown</button><button type="button" :aria-pressed="!editing" @click="editor.editMarkdown('')">预览 Markdown</button></div>
    </div>
    <div v-if="editing" class="markdown-canvas-editor">
      <div class="markdown-format-toolbar" aria-label="Markdown 格式"><button type="button" @click="insert('## ', '', '标题')">标题</button><button type="button" @click="insert('**', '**')"><b>粗体</b></button><button type="button" @click="insert('- ', '', '列表项')">列表</button><button type="button" @click="insert('[', '](https://example.com)', '链接文字')">链接</button><button type="button" @click="insert('```\n', '\n```', '代码')">代码</button><span>Markdown 源码</span></div>
      <textarea ref="source" class="markdown-canvas-source" aria-label="Markdown 内容" :value="block.content" spellcheck="false" placeholder="## 标题&#10;&#10;在这里开始写作…" @input="update(($event.target as HTMLTextAreaElement).value)" @keydown.esc.stop="editor?.editMarkdown('')" />
      <div class="markdown-editor-caption"><span>支持 Markdown 语法 · Ctrl / ⌘ S 保存</span><span>Esc 返回预览</span></div>
    </div>
    <div v-else class="markdown-content" v-html="html" />
  </section>
</template>
