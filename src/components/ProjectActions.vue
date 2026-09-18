<script setup lang="ts">
import type { Project, SiteConfig } from '../../shared/config'
import ArrowIcon from './ArrowIcon.vue'
defineProps<{ project: Project; labels: SiteConfig['labels']; featured?: boolean }>()
</script>

<template>
  <div class="project-actions">
    <a v-if="project.demoUrl" :href="project.demoUrl" :class="['button', featured ? 'button-primary' : 'button-soft']" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name} · ${labels.demo}`">{{ labels.demo }}<ArrowIcon :light="featured" /></a>
    <a v-if="project.githubUrl" :href="project.githubUrl" class="button button-outline" target="_blank" rel="noopener noreferrer" :aria-label="`${project.name} · ${labels.source}`">{{ labels.source }}<ArrowIcon /></a>
    <p v-if="!project.demoUrl && !project.githubUrl" class="muted no-links">{{ labels.noProjectLinks }}</p>
  </div>
</template>
