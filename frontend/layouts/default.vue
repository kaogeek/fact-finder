<template>
  <v-app>
    <Nuxt />
    <v-card class="logo" dark>Fact Finder</v-card>
    <!-- <v-main>
        <Nuxt />
    </v-main> -->
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      title: "Vuetify.js",
    };
  },
};
</script>

<style>
/* html, body, #__nuxt, #__layout, #app {
  height: 100%;
} */
#app {
  font-family: "Prompt", sans-serif;
}
.logo {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 160px;
  padding: 10px;
  font-size: 24px;
  display: flex;
  justify-content: center;
}
</style>
