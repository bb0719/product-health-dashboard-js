<template>
  <v-app>
    <v-main>
      <nav-bar />
      <v-container fluid>
        <Nuxt> </Nuxt>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from '~/components/NavBar.vue'
export default {
  components: { NavBar },
}
</script>
