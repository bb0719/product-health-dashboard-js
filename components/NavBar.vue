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
        <v-menu
          :close-on-click="closeOnClick"
          v-for="item in navbarItems"
          :key="item.title"
          open-on-hover
          offset-y
          down
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :to="item.path ? item.path : null"
              text
              :nuxt="item.path ? true : false"
              v-bind="attrs"
              v-on="on"
            >
              {{ item.title }}
            </v-btn>
          </template>
          <template v-if="item.children.length > 0">
            <v-list>
              <v-list-item
                v-for="subItem in item.children"
                :key="subItem.title"
                nuxt
                :to="subItem.path"
              >
                <v-list-item-title>
                  {{ subItem.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </template>
        </v-menu>
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
          children: [],
        },
        {
          title: 'OUS Anomaly Detector',
          path: '/anomaly-detector/OUS',
          children: [],
        },
        {
          title: 'Misc Dashboards',
          children: [
            { title: 'G6 US 1.9 Release', path: '/dashboards/release-1.9' },
          ],
        },
      ],
      closeOnClick: true,
    }
  },
}
</script>

<style>
</style>
