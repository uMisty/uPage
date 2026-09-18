<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>

<template>
  <img class="arrow-icon" :src="`/assets/icon-arrow-up-right-${light ? 'white' : 'ink'}.svg`" alt="" width="24" height="24" aria-hidden="true" />
</template>
