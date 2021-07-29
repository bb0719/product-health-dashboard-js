<template>
  <div></div>
</template>

<script>
export default {
  middleware({ route, redirect }) {
    return redirect(route.fullPath + '/daily-anomalies') // this page just reroutes
  },
}
</script>
