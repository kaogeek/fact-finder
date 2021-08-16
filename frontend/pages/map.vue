<template>
  <div class="map_box_container">
    <div id="map"></div>
    <!-- <div class="color-test"></div> -->
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";

export default {
  data() {
    return {
      access_token:
        "pk.eyJ1Ijoibml0aWtvcm4iLCJhIjoiY2p6ZHR0Yjk0MDNxNDNncGhqbDk5M3ZpaCJ9.FW231UaLDWmlgt3d7HQ1yg",
      map: {},
    };
  },
  mounted() {
    this.createMap();
  },
  methods: {
    createMap() {
      mapboxgl.accessToken = this.access_token;
      this.map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/mapbox/streets-v11", // style URL
        center: [100.53826, 13.764981], // starting position [lng, lat]
        zoom: 15, // starting zoom
      });
      this.map.on("load", function () {
        this.map.resize();
      });
    },
  },
};
</script>

<style>
.map_box_container {
  position: relative;
  height: 100% !important;
  width: 100% !important;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>
