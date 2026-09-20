<script setup lang="ts">
import { usePageEditing } from '../editor/pageEditing'
import ArrowIcon from './ArrowIcon.vue'
const { vEdit } = usePageEditing()
defineProps<{ id: string; eyebrow: string; title: string; moreLabel?: string; moreUrl?: string; editPath?: string }>()
</script>

<template>
  <header class="section-heading">
    <div><p class="eyebrow" v-edit="editPath ? `${editPath}.eyebrow` : ''">{{ eyebrow }}</p><h2 :id="id" v-edit="editPath ? `${editPath}.title` : ''">{{ title }}</h2></div>
    <a v-if="moreUrl && moreLabel" class="text-link section-more" :href="moreUrl" target="_blank" rel="noopener noreferrer"><span v-edit="editPath ? `${editPath}.moreLabel` : ''">{{ moreLabel }}</span><ArrowIcon /></a>
    <slot />
  </header>
</template>
