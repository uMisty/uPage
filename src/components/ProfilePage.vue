<script setup lang="ts">
import { computed } from 'vue'
import type { SiteConfig } from '../../shared/config'
import ArrowIcon from './ArrowIcon.vue'
import SectionHeading from './SectionHeading.vue'
import ProjectShowcase from './ProjectShowcase.vue'
import BlogFeed from './BlogFeed.vue'
const props = defineProps<{ config: SiteConfig }>()
const toolGroups = computed(() => props.config.toolGroups.filter(group => group.items.length))
const blogHref = computed(() => props.config.blog.url || (props.config.blog.enabled ? '#writing' : ''))
</script>

<template>
  <a class="skip-link" href="#main-content">跳转到主要内容</a>
  <main id="main-content" class="page-shell">
    <section class="hero" aria-labelledby="profile-name">
      <div class="hero-copy">
        <p class="eyebrow">{{ config.profile.eyebrow }}</p>
        <h1 id="profile-name" :class="{ 'long-name': config.profile.name.length > 7 }">{{ config.profile.name }}<span>{{ config.profile.suffix }}</span></h1>
        <p class="hero-headline desktop-copy">{{ config.profile.headline }}</p>
        <p class="hero-headline mobile-copy"><template v-if="config.profile.headlineLines.length"><span v-for="(line, index) in config.profile.headlineLines" :key="index">{{ line }}</span></template><template v-else>{{ config.profile.headline }}</template></p>
        <div class="hero-bio"><p v-for="(line, index) in config.profile.bio" :key="index">{{ line }}</p></div>
        <div class="hero-actions">
          <a v-if="blogHref" :href="blogHref" class="button button-primary" :target="blogHref.startsWith('#') ? undefined : '_blank'" rel="noopener noreferrer">{{ config.profile.blogLabel }}<ArrowIcon light /></a>
          <a v-if="config.projects.length" href="#projects" class="text-link">{{ config.profile.projectsLabel }}<ArrowIcon /></a>
        </div>
      </div>
      <figure class="hero-art"><img v-if="config.profile.image" :src="config.profile.image" :alt="config.profile.imageAlt" width="500" height="480" fetchpriority="high" /><figcaption class="eyebrow">{{ config.profile.motto.join('') }}</figcaption></figure>
    </section>

    <ProjectShowcase :config="config" />

    <section v-if="config.blog.enabled || config.now.enabled" id="writing" class="writing section" :class="{ 'writing-single': !config.blog.enabled || !config.now.enabled }" :aria-labelledby="config.blog.enabled ? 'writing-title' : 'now-title'">
      <BlogFeed v-if="config.blog.enabled" :config="config" />
      <aside v-if="config.now.enabled" class="now-card" aria-labelledby="now-title">
        <p class="eyebrow">{{ config.now.eyebrow }}</p>
        <h2 id="now-title"><span v-for="(line, index) in config.now.title" :key="index">{{ line }}</span></h2>
        <dl><div v-for="(item, index) in config.now.items" :key="index"><dt>{{ item.label }}</dt><dd>{{ item.text }}</dd></div></dl>
        <p v-if="config.now.updatedLabel" class="now-updated">{{ config.now.updatedLabel }}</p>
      </aside>
    </section>

    <section v-if="toolGroups.length" class="toolkit section" aria-labelledby="tools-title">
      <header><p class="eyebrow">{{ config.sections.tools.eyebrow }}</p><h2 id="tools-title">{{ config.sections.tools.title }}</h2><p class="toolkit-description">{{ config.sections.tools.description }}</p></header>
      <div class="tool-groups">
        <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
          <h3>{{ group.name }}</h3>
          <ul class="tool-items"><li v-for="(tool, toolIndex) in group.items" :key="toolIndex"><component :is="tool.url ? 'a' : 'div'" :href="tool.url || undefined" :target="tool.url ? '_blank' : undefined" :rel="tool.url ? 'noopener noreferrer' : undefined" class="tool-item"><span class="tool-icon"><img v-if="tool.icon" :src="tool.icon" alt="" width="24" height="24" loading="lazy" /><span v-else>{{ tool.mark || tool.name.slice(0, 2) }}</span></span><span class="tool-text"><strong>{{ tool.name }}</strong><span>{{ tool.purpose }}</span></span></component></li></ul>
        </div>
      </div>
    </section>

    <section v-if="config.interests.length" class="interests section" aria-labelledby="interests-title">
      <SectionHeading id="interests-title" v-bind="config.sections.interests"><p class="section-description">{{ config.sections.interests.description }}</p></SectionHeading>
      <div class="interest-grid"><article v-for="(interest, index) in config.interests" :key="index"><img v-if="interest.image" :src="interest.image" :alt="interest.imageAlt" width="400" height="200" loading="lazy" /><h3>{{ interest.name }}</h3><p>{{ interest.description }}</p></article></div>
    </section>

    <section v-if="config.contact.enabled" class="contact section" aria-labelledby="contact-title">
      <div><p class="eyebrow">{{ config.contact.eyebrow }}</p><h2 id="contact-title"><span class="desktop-copy">{{ config.contact.title }}</span><span class="mobile-copy">{{ config.contact.mobileTitle || config.contact.title }}</span></h2><p class="contact-description desktop-copy">{{ config.contact.description }}</p><p class="contact-description mobile-copy">{{ config.contact.mobileDescription || config.contact.description }}</p><a v-if="config.contact.email" :href="`mailto:${config.contact.email}`" class="contact-email">{{ config.contact.email }}<ArrowIcon class="contact-mobile-arrow" /></a></div>
      <a v-if="config.contact.email" :href="`mailto:${config.contact.email}`" class="contact-orb" :aria-label="`发送邮件至 ${config.contact.email}`"><ArrowIcon light /></a>
    </section>

    <footer class="footer"><p>{{ config.site.footer }}</p><a v-if="config.site.footerUrl" :href="config.site.footerUrl" target="_blank" rel="noopener noreferrer">{{ config.site.footerLabel }}</a><span v-else>{{ config.site.footerLabel }}</span></footer>
  </main>
</template>
