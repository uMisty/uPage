<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue/offline'
import { getToolIcon } from '../../shared/tool-icons'
const props = defineProps<{ name: string }>()
const data = computed(() => getToolIcon(props.name))
</script>
<template><Icon v-if="data" :icon="data" width="24" height="24" :aria-hidden="true" /></template>
