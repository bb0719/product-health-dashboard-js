<template>
  <div>
    <div v-if="fetchState.pending" class="text-center mt-5">
      <v-progress-circular
        :size="200"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    <div v-else-if="fetchState.error">
      <p>Something went wrong...</p>
      {{ fetchState.error.message }}
    </div>
    <div v-else class="mt-5">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fetchState: {
      required: true,
      type: Object,
    },
  },
}
</script>

<style>
</style>
