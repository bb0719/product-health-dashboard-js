<template>
  <div>
    <v-card
      min-height="300"
      flat
      class="grey lighten-2 mt-5 d-flex flex-column justify-center align-center"
    >
      <v-card-title class="text-h2">
        Welcome to the Product Health Dashboard
      </v-card-title>

      <v-card-subtitle class="text-h5">
        Select a module from the navigation bar...
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      err: '',
      res: '',
    }
  },
}
</script>
