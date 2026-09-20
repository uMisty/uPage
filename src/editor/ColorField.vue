<script setup lang="ts">
import { computed, ref, watch } from 'vue'
const props = withDefaults(defineProps<{ modelValue: string; label: string; fallback?: string; allowReset?: boolean }>(), { fallback: '#242822', allowReset: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const draft = ref(props.modelValue || props.fallback)
const error = ref('')
const current = computed(() => /^#[\da-f]{6}$/i.test(props.modelValue) ? props.modelValue : props.fallback)
watch(() => [props.modelValue, props.fallback], () => { draft.value = props.modelValue || props.fallback; error.value = '' })
function update(value: string) {
  draft.value = value
  let hex = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(hex)) hex = [...hex].map(char => char + char).join('')
  if (!/^[\da-f]{6}$/i.test(hex)) { error.value = '请输入 3 位或 6 位十六进制色码。'; return }
  error.value = ''; emit('update:modelValue', `#${hex.toUpperCase()}`)
}
const presets = ['#242822', '#71766C', '#FFFFFF', '#2853E8', '#7856C8', '#DC4965', '#DF9E3D', '#31856C']
</script>
<template>
  <div class="color-field"><span class="color-label">{{ label }}</span><details class="color-picker" @keydown.esc="($event.currentTarget as HTMLDetailsElement).open = false"><summary :aria-label="`调整${label}`"><span class="color-swatch" :style="{ background: current }" /><span>{{ modelValue || '默认颜色' }}</span><span class="color-chevron">⌄</span></summary><div class="color-popover"><label class="native-color-label"><span>拾取颜色</span><input type="color" :aria-label="`${label}拾色器`" :value="current" @input="update(($event.target as HTMLInputElement).value)" /></label><label class="hex-field"><span>HEX</span><input :aria-label="`${label}色码`" :value="draft" maxlength="7" spellcheck="false" :aria-invalid="!!error" @input="draft = ($event.target as HTMLInputElement).value; error = ''" @change="update(draft)" @keydown.enter.prevent="update(draft)" /></label><div class="color-presets"><button v-for="color in presets" :key="color" type="button" :style="{ background: color }" :aria-label="`使用 ${color}`" @click="update(color)" /></div><p v-if="error" class="color-error" role="alert">{{ error }}</p><button v-if="allowReset" type="button" class="color-reset" @click="emit('update:modelValue', ''); draft = fallback; error = ''">恢复默认颜色</button></div></details></div>
</template>
