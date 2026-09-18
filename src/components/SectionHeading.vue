<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue'
defineProps<{ id: string; eyebrow: string; title: string; moreLabel?: string; moreUrl?: string }>()
</script>

<template>
  <header class="section-heading">
    <div><p class="eyebrow">{{ eyebrow }}</p><h2 :id="id">{{ title }}</h2></div>
    <a v-if="moreUrl && moreLabel" class="text-link section-more" :href="moreUrl" target="_blank" rel="noopener noreferrer">{{ moreLabel }}<ArrowIcon /></a>
    <slot />
  </header>
</template>
