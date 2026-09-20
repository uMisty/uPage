<script setup lang="ts">
import { usePageEditing } from '../editor/pageEditing'
import type { Project, SiteConfig } from '../../shared/config'
import ArrowIcon from './ArrowIcon.vue'
const { vEdit } = usePageEditing()
defineProps<{ project: Project; labels: SiteConfig['labels']; featured?: boolean }>()
</script>

<template>
  <div class="project-actions">
    <a v-if="project.demoUrl" :href="project.demoUrl" :class="['button', featured ? 'button-primary' : 'button-soft']" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name} · ${labels.demo}`"><span v-edit="'labels.demo'">{{ labels.demo }}</span><ArrowIcon :light="featured" /></a>
    <a v-if="project.githubUrl" :href="project.githubUrl" class="button button-outline" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name} · ${labels.source}`"><span v-edit="'labels.source'">{{ labels.source }}</span><ArrowIcon /></a>
    <p v-if="!project.demoUrl && !project.githubUrl" class="muted no-links" v-edit="'labels.noProjectLinks'">{{ labels.noProjectLinks }}</p>
  </div>
</template>
