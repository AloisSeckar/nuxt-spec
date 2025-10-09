<template>
  <div style="margin: 1rem 0; padding: 0.5rem; border: 1px solid black;">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps({ text: { type: String, default: 'nuxt-spec' } })
</script>
