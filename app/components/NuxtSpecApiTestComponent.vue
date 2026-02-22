<template>
  <div>
    <h2>API Test</h2>
    <button id="api-fetch" @click="fetchData">
      Fetch Data
    </button>
    <div id="api-result">
      {{ data }}
    </div>
  </div>
</template>

<script setup lang="ts">
const data = ref('')
const fetchData = async () => {
  try {
    data.value = await $fetch('https://jsonplaceholder.typicode.com/posts/1')
    console.debug('Fetched data:', data.value)
  } catch (error) {
    data.value = 'Error fetching data'
    console.error('API fetch error:', error)
  }
}
</script>
