<script setup lang="ts">
import { textColorsKey, usePageEditing } from '../editor/pageEditing'
import { computed, provide } from 'vue'
import { defaultLayout, type SectionType } from '../../shared/pages'
import type { SiteConfig } from '../../shared/config'
import ArrowIcon from './ArrowIcon.vue'
import SectionHeading from './SectionHeading.vue'
import ProjectShowcase from './ProjectShowcase.vue'
import BlogFeed from './BlogFeed.vue'
import MarkdownSection from './MarkdownSection.vue'
import ExtraSection from './ExtraSection.vue'
import ToolIcon from './ToolIcon.vue'
import { getToolIcon } from '../../shared/tool-icons'
import { extraNames, type ExtraSection as ExtraSectionType } from '../../shared/extra-sections'
const props = defineProps<{ config: SiteConfig; layout?: SectionType[] }>()
const textColors = computed(() => props.config.textColors ?? {})
provide(textColorsKey, textColors)
const { vEdit, vImage, vSection } = usePageEditing(textColors)
const toolGroups = computed(() => props.config.toolGroups.filter(group => group.items.length))
const blogHref = computed(() => props.config.blog.url || (props.config.blog.enabled && (props.layout ?? defaultLayout).includes('writing') ? '#writing' : ''))
</script>

<template>
  <a class="skip-link" href="#main-content">跳转到主要内容</a>
  <main id="main-content" class="page-shell">
    <template v-for="block in (layout ?? defaultLayout)" :key="block">
    <ExtraSection v-if="block in extraNames" :type="block as ExtraSectionType" :config="config" />
    <MarkdownSection v-if="block.startsWith('markdown-') && config.markdownBlocks?.[block]" :id="block as `markdown-${string}`" :block="config.markdownBlocks[block]" />
    <section v-if="block === 'profile'" v-section="'profile'" class="hero" aria-labelledby="profile-name">
      <div class="hero-copy">
        <p class="eyebrow" v-edit="'profile.eyebrow'">{{ config.profile.eyebrow }}</p>
        <h1 id="profile-name" :class="{ 'long-name': config.profile.name.length > 7 }"><span v-edit="'profile.name'">{{ config.profile.name }}</span><span v-edit="'profile.suffix'">{{ config.profile.suffix }}</span></h1>
        <p class="hero-headline desktop-copy" v-edit="'profile.headline'">{{ config.profile.headline }}</p>
        <p class="hero-headline mobile-copy"><template v-if="config.profile.headlineLines.length"><span v-for="(line, index) in config.profile.headlineLines" :key="index" v-edit="`profile.headlineLines.${index}`">{{ line }}</span></template><span v-else v-edit="'profile.headline'">{{ config.profile.headline }}</span></p>
        <div class="hero-bio"><p v-for="(line, index) in config.profile.bio" :key="index" v-edit="`profile.bio.${index}`">{{ line }}</p></div>
        <div class="hero-actions">
          <a v-if="blogHref" :href="blogHref" class="button button-primary" :target="blogHref.startsWith('#') ? undefined : '_blank'" rel="noopener noreferrer"><span v-edit="'profile.blogLabel'">{{ config.profile.blogLabel }}</span><ArrowIcon light /></a>
          <a v-if="config.projects.length && (layout ?? defaultLayout).includes('projects')" href="#projects" class="text-link"><span v-edit="'profile.projectsLabel'">{{ config.profile.projectsLabel }}</span><ArrowIcon /></a>
        </div>
      </div>
      <figure class="hero-art"><img v-if="config.profile.image" v-image="'profile.image'" :src="config.profile.image" :alt="config.profile.imageAlt" width="500" height="480" fetchpriority="high" /><figcaption class="eyebrow" v-edit="{ path: 'profile.motto', separator: '\n' }">{{ config.profile.motto.join('') }}</figcaption></figure>
    </section>

    <ProjectShowcase v-if="block === 'projects'" :config="config" />

    <section v-if="block === 'writing' && (config.blog.enabled || config.now.enabled)" v-section="'writing'" id="writing" class="writing section" :class="{ 'writing-single': !config.blog.enabled || !config.now.enabled }" :aria-labelledby="config.blog.enabled ? 'writing-title' : 'now-title'">
      <BlogFeed v-if="config.blog.enabled" :config="config" />
      <aside v-if="config.now.enabled" class="now-card" aria-labelledby="now-title">
        <p class="eyebrow" v-edit="'now.eyebrow'">{{ config.now.eyebrow }}</p>
        <h2 id="now-title"><span v-for="(line, index) in config.now.title" :key="index" v-edit="`now.title.${index}`">{{ line }}</span></h2>
        <dl><div v-for="(item, index) in config.now.items" :key="index"><dt v-edit="`now.items.${index}.label`">{{ item.label }}</dt><dd v-edit="`now.items.${index}.text`">{{ item.text }}</dd></div></dl>
        <p v-if="config.now.updatedLabel" class="now-updated" v-edit="'now.updatedLabel'">{{ config.now.updatedLabel }}</p>
      </aside>
    </section>

    <section v-if="block === 'tools' && toolGroups.length" v-section="'tools'" class="toolkit section" aria-labelledby="tools-title">
      <header><p class="eyebrow" v-edit="'sections.tools.eyebrow'">{{ config.sections.tools.eyebrow }}</p><h2 id="tools-title" v-edit="'sections.tools.title'">{{ config.sections.tools.title }}</h2><p class="toolkit-description" v-edit="'sections.tools.description'">{{ config.sections.tools.description }}</p></header>
      <div class="tool-groups">
        <div v-for="(group, index) in toolGroups" :key="index" class="tool-group">
          <h3 v-edit="`toolGroups.${config.toolGroups.indexOf(group)}.name`">{{ group.name }}</h3>
          <ul class="tool-items"><li v-for="(tool, toolIndex) in group.items" :key="toolIndex"><component :is="tool.url ? 'a' : 'div'" :href="tool.url || undefined" :target="tool.url ? '_blank' : undefined" :rel="tool.url ? 'noopener noreferrer' : undefined" class="tool-item"><span class="tool-icon" v-image="`toolGroups.${config.toolGroups.indexOf(group)}.items.${toolIndex}.icon`"><ToolIcon v-if="getToolIcon(tool.icon)" :name="tool.icon" /><img v-else-if="tool.icon" :src="tool.icon" alt="" width="24" height="24" loading="lazy" /><span v-else>{{ tool.mark || tool.name.slice(0, 2) }}</span></span><span class="tool-text"><strong v-edit="`toolGroups.${config.toolGroups.indexOf(group)}.items.${toolIndex}.name`">{{ tool.name }}</strong><span v-edit="`toolGroups.${config.toolGroups.indexOf(group)}.items.${toolIndex}.purpose`">{{ tool.purpose }}</span></span></component></li></ul>
        </div>
      </div>
    </section>

    <section v-if="block === 'interests' && config.interests.length" v-section="'interests'" class="interests section" aria-labelledby="interests-title">
      <SectionHeading id="interests-title" v-bind="config.sections.interests" edit-path="sections.interests"><p class="section-description" v-edit="'sections.interests.description'">{{ config.sections.interests.description }}</p></SectionHeading>
      <div class="interest-grid"><article v-for="(interest, index) in config.interests" :key="index"><img v-if="interest.image" v-image="`interests.${index}.image`" :src="interest.image" :alt="interest.imageAlt" width="400" height="200" loading="lazy" /><h3 v-edit="`interests.${index}.name`">{{ interest.name }}</h3><p v-edit="`interests.${index}.description`">{{ interest.description }}</p></article></div>
    </section>

    <section v-if="block === 'contact' && config.contact.enabled" v-section="'contact'" class="contact section" aria-labelledby="contact-title">
      <div><p class="eyebrow" v-edit="'contact.eyebrow'">{{ config.contact.eyebrow }}</p><h2 id="contact-title"><span class="desktop-copy" v-edit="'contact.title'">{{ config.contact.title }}</span><span class="mobile-copy" v-edit="'contact.mobileTitle'">{{ config.contact.mobileTitle || config.contact.title }}</span></h2><p class="contact-description desktop-copy" v-edit="'contact.description'">{{ config.contact.description }}</p><p class="contact-description mobile-copy" v-edit="'contact.mobileDescription'">{{ config.contact.mobileDescription || config.contact.description }}</p><a v-if="config.contact.email" :href="`mailto:${config.contact.email}`" class="contact-email"><span v-edit="'contact.email'">{{ config.contact.email }}</span><ArrowIcon class="contact-mobile-arrow" /></a></div>
      <a v-if="config.contact.email" :href="`mailto:${config.contact.email}`" class="contact-orb" :aria-label="`发送邮件至 ${config.contact.email}`"><ArrowIcon light /></a>
    </section>

    <footer v-if="block === 'footer'" v-section="'footer'" class="footer"><p v-edit="'site.footer'">{{ config.site.footer }}</p><a v-if="config.site.footerUrl" :href="config.site.footerUrl" target="_blank" rel="noopener noreferrer" v-edit="'site.footerLabel'">{{ config.site.footerLabel }}</a><span v-else v-edit="'site.footerLabel'">{{ config.site.footerLabel }}</span></footer>
    </template>
  </main>
</template>
