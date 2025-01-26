<template>
  <div>
    {{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps({ text: { type: String, default: 'nuxt-spec' } })
</script>
