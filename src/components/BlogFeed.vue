<script setup lang="ts">
import type { SiteConfig } from '../../shared/config'
import { useFeed } from '../composables/useFeed'
import ArrowIcon from './ArrowIcon.vue'
import SectionHeading from './SectionHeading.vue'
const props = defineProps<{ config: SiteConfig }>()
const { articles, loading, failed, stale, load } = useFeed(props.config.blog)
const shortDate = (date: string) => date ? date.slice(5, 10).replace('-', '.') : ''
</script>

<template>
  <div class="writing-main">
    <SectionHeading id="writing-title" v-bind="config.sections.writing" edit-path="sections.writing" :more-url="config.blog.url" />
    <div class="article-list" :aria-busy="loading">
      <div v-if="loading && !articles.length" class="feed-state" role="status">
        <span class="sr-only">{{ config.labels.loading }}</span>
        <div v-for="index in config.blog.limit" :key="index" class="article-skeleton" aria-hidden="true"><span /><span /></div>
      </div>
      <div v-else-if="failed" class="feed-state feed-message" role="status"><p>{{ config.labels.feedError }}</p><button class="button button-outline" @click="load">{{ config.labels.retry }}</button></div>
      <p v-else-if="!articles.length" class="feed-state feed-message" role="status">{{ config.labels.emptyFeed }}</p>
      <a v-for="article in articles" :key="article.url" class="article-row" :href="article.url" target="_blank" rel="noopener noreferrer">
        <time v-if="article.publishedAt" class="article-date" :datetime="article.publishedAt">{{ shortDate(article.publishedAt) }}</time>
        <div class="article-copy"><h3>{{ article.title }}</h3><p class="article-meta"><span>{{ article.category || config.blog.defaultCategory }}</span><template v-if="config.blog.showReadingTime && article.readingMinutes"><span aria-hidden="true"> / </span><span>{{ article.readingMinutes }} 分钟</span></template><time v-if="article.publishedAt" class="article-mobile-date" :datetime="article.publishedAt"> / {{ shortDate(article.publishedAt) }}</time></p></div>
        <ArrowIcon />
      </a>
    </div>
    <p v-if="stale" class="feed-notice" role="status">{{ config.labels.staleFeed }} <button class="inline-button" :disabled="loading" @click="load">{{ config.labels.retry }}</button></p>
  </div>
</template>
