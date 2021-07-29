<template>
  <div>
    <v-toolbar class="justify-center">
      <v-spacer></v-spacer>
      <v-toolbar-title
        to="/"
        style="cursor: pointer"
        @click="$router.push('/')"
      >
        {{ appTitle }}
      </v-toolbar-title>
      <v-toolbar-items class="ml-5 mr-5">
        <v-btn
          v-for="item in navbarItems"
          :key="item.title"
          :to="item.path"
          text
          nuxt
        >
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      appTitle: 'Product Health Dashboard',
      navbarItems: [
        {
          title: 'US Anomaly Detector',
          path: '/anomaly-detector/US',
        },
        {
          title: 'OUS Anomaly Detector',
          path: '/anomaly-detector/OUS',
        },
      ],
    }
  },
}
</script>

<style>
</style>
