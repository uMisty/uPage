<script setup lang="ts">
import { computed } from 'vue'
import { selectFeatured, type SiteConfig } from '../../shared/config'
import SectionHeading from './SectionHeading.vue'
import ProjectActions from './ProjectActions.vue'
import ArrowIcon from './ArrowIcon.vue'
const props = defineProps<{ config: SiteConfig }>()
const selected = computed(() => selectFeatured(props.config.projects))
const featured = computed(() => props.config.projects[selected.value])
const rest = computed(() => props.config.projects.filter((_, index) => index !== selected.value))
</script>

<template>
  <section v-if="featured" id="projects" class="projects section" aria-labelledby="projects-title">
    <SectionHeading id="projects-title" v-bind="config.sections.projects" />
    <article class="featured-project" :class="{ 'no-art': !featured.image }" :style="{ background: featured.background }">
      <div class="featured-title"><span class="release-badge">{{ featured.releaseLabel }}</span><h3>{{ featured.name }}</h3></div>
      <div v-if="featured.image" class="featured-visual"><img class="featured-image" :src="featured.image" :alt="featured.imageAlt || featured.name" width="800" height="450" loading="lazy" /></div>
      <div class="featured-details">
        <p class="project-description">{{ featured.summary || featured.description }}</p>
        <p v-if="featured.tags.length" class="project-tags">{{ featured.tags.join(' + ') }}</p>
        <ProjectActions :project="featured" :labels="config.labels" featured />
      </div>
      <p v-if="featured.releasedAt || config.labels.projectDateSuffix" class="project-release">{{ [featured.releasedAt.slice(0, 7).replace('-', '.'), config.labels.projectDateSuffix].filter(Boolean).join(' · ') }}</p>
    </article>
    <div v-if="rest.length" class="project-list">
      <article v-for="(project, index) in rest" :key="`${project.name}-${index}`" class="project-row" :class="{ 'no-image': !project.image }">
        <img v-if="project.image" :src="project.image" :alt="project.imageAlt || project.name" width="208" height="117" loading="lazy" class="project-thumbnail" />
        <div class="project-copy"><h3>{{ project.name }}</h3></div>
        <p class="project-description">{{ project.description }}</p>
        <p v-if="project.tags.length" class="project-tags">{{ project.tags.join(' + ') }}</p>
        <ProjectActions :project="project" :labels="config.labels" />
      </article>
    </div>
    <a v-if="config.sections.projects.moreUrl" class="text-link mobile-projects-more" :href="config.sections.projects.moreUrl" target="_blank" rel="noopener noreferrer">{{ config.sections.projects.moreLabel }}<ArrowIcon /></a>
  </section>
</template>
