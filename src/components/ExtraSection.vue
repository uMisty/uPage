<script setup lang="ts">
import { computed } from 'vue'
import type { SiteConfig } from '../../shared/config'
import type { ExtraSection } from '../../shared/extra-sections'
import { usePageEditing } from '../editor/pageEditing'
const props = defineProps<{ type: ExtraSection; config: SiteConfig }>()
const { vEdit, vImage, vSection } = usePageEditing()
const heading = computed(() => props.config[props.type])
</script>
<template>
  <section v-section="type" class="extra-section section" :class="`extra-${type}`" :aria-labelledby="`${type}-title`">
    <header class="extra-heading"><p class="eyebrow" v-edit="`${type}.eyebrow`">{{ heading.eyebrow }}</p><h2 :id="`${type}-title`" v-edit="`${type}.title`">{{ heading.title }}</h2><p class="section-description" v-edit="`${type}.description`">{{ heading.description }}</p></header>
    <ol v-if="type === 'timeline'" class="experience-list"><li v-for="(item, index) in config.timeline.items" :key="index"><p class="experience-period" v-edit="`timeline.items.${index}.period`">{{ item.period }}</p><div class="experience-copy"><p class="eyebrow" v-edit="`timeline.items.${index}.organization`">{{ item.organization }}</p><h3 v-edit="`timeline.items.${index}.title`">{{ item.title }}</h3><p v-edit="`timeline.items.${index}.description`">{{ item.description }}</p><a v-if="item.url" :href="item.url" class="extra-more">了解更多 ↗</a></div></li></ol>
    <div v-else-if="type === 'articles'" class="curated-articles"><article v-for="(item, index) in config.articles.items" :key="index"><div class="curated-meta"><span v-edit="`articles.items.${index}.category`">{{ item.category }}</span><span v-edit="`articles.items.${index}.date`">{{ item.date }}</span></div><component :is="item.url ? 'a' : 'div'" :href="item.url || undefined" class="curated-title"><h3 v-edit="`articles.items.${index}.title`">{{ item.title }}</h3><span v-if="item.url" aria-hidden="true">↗</span></component><p v-edit="`articles.items.${index}.description`">{{ item.description }}</p></article></div>
    <div v-else-if="type === 'gallery'" class="photo-grid"><figure v-for="(item, index) in config.gallery.items" :key="index"><div class="photo-frame"><img v-if="item.image" v-image="`gallery.items.${index}.image`" :src="item.image" :alt="item.imageAlt" loading="lazy" width="600" height="450" /><span v-else class="photo-placeholder" aria-label="尚未添加图片">{{ String(index + 1).padStart(2, '0') }}</span></div><figcaption><component :is="item.url ? 'a' : 'div'" :href="item.url || undefined"><h3 v-edit="`gallery.items.${index}.title`">{{ item.title }}</h3></component><p v-edit="`gallery.items.${index}.description`">{{ item.description }}</p></figcaption></figure></div>
    <div v-else-if="type === 'links'" class="blogroll-grid"><article v-for="(item, index) in config.links.items" :key="index"><span class="blogroll-avatar"><img v-if="item.icon" v-image="`links.items.${index}.icon`" :src="item.icon" alt="" loading="lazy" width="42" height="42" /><span v-else>{{ item.name.slice(0, 1) || '↗' }}</span></span><div><component :is="item.url ? 'a' : 'div'" :href="item.url || undefined"><h3 v-edit="`links.items.${index}.name`">{{ item.name }}</h3></component><p v-edit="`links.items.${index}.description`">{{ item.description }}</p><span v-if="item.url" class="blogroll-url">{{ item.url }}</span></div></article></div>
    <div v-else-if="type === 'faq'" class="faq-list"><details v-for="(item, index) in config.faq.items" :key="index"><summary><span v-edit="`faq.items.${index}.question`">{{ item.question }}</span><span class="faq-toggle" aria-hidden="true">＋</span></summary><p v-edit="`faq.items.${index}.answer`">{{ item.answer }}</p></details></div>
  </section>
</template>
