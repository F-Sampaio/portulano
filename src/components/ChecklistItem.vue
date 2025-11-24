<template>
  <label class="chk">
    <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', !modelValue)" />
    <span :class="{done: modelValue}"><slot /></span>
  </label>
</template>

<script setup>
defineProps({ modelValue: { type: Boolean, default: false } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.chk { display:flex; gap:.5rem; align-items:center; }
.done { text-decoration: line-through; color:#667085; }
</style>
