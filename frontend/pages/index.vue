<template>
  <v-row class="main-row">
    <v-col class="map-area pa-0" cols="12" sm="8" md="8">
      <div id="map"></div>
      <div class="timeline-area">
        <v-row>
          <v-col>
            <b>วันที่</b>
            <v-text-field v-model="searchKeyword" label="คำค้นหา" solo></v-text-field>
          </v-col>
          <v-col>
            <b>ตั้งแต่เวลา</b>
            <v-select
              v-model="selectedTime"
              :items="timeSlots"
              label="คำค้นหา"
              solo
            ></v-select>
          </v-col>
          <v-col>
            <b>ถึงเวลา</b>
            <v-select
              v-model="selectedTime"
              :items="timeSlots"
              label="คำค้นหา"
              solo
            ></v-select>
          </v-col>
        </v-row>
        <div class="time-slider">
          <v-btn :color="'rgba(25, 118, 210, 1)'" dark depressed fab>
            <v-icon large>{{ isPlaying ? "mdi-pause" : "mdi-play" }}</v-icon>
          </v-btn>
          <vue-slider
            class="ml-4"
            width="820px"
            height="10px"
            v-model="slider"
            :adsorb="true"
            :included="true"
          ></vue-slider>
        </div>
      </div>
    </v-col>
    <v-col class="search-area d-flex flex-column pl-0" cols="12" sm="4" md="4">
      <div class="top-menu pl-3 pr-0 pt-6">
        <p><b>ภาพเหตุการณ์ในบริเวณนี้</b></p>
        <v-row>
          <v-col cols="12" sm="7" md="7">
            <v-text-field
              v-model="searchKeyword"
              label="คำค้นหา"
              outlined
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="5" md="5">
            <v-select
              v-model="selectedTime"
              :items="timeSlots"
              outlined
              label="ความละเอียด"
            ></v-select>
          </v-col>
        </v-row>
        <div>
          แท๊กสำคัญในวันนี้:
          <v-chip v-for="item in tags" :key="item.value" class="ma-2"
            >#{{ item.name_th }}</v-chip
          >
        </div>
        <div>สัญลักษณ์ / Filters</div>
        <div class="d-flex flex-column mt-5 mb-5">
          <v-row>
            <v-checkbox
              class="ml-2 mr-2 mt-0"
              v-for="item in filter"
              :key="item.value"
              v-model="selectedFilter"
              :label="item.name_th"
              :value="item.value"
            ></v-checkbox>
          </v-row>
        </div>
      </div>
      <div class="bottom-menu pa-0">
        <div class="d-flex flex-column pa-4">
          <div class="mb-4">15:00</div>
          <v-row>
            <v-col v-for="n in 2" :key="n" cols="auto">
              <v-card :elevation="4" height="80" width="80" class="primary"> </v-card>
            </v-col>
          </v-row>
        </div>
        <div class="d-flex flex-column pa-4">
          <div class="mb-4">15:05</div>
          <v-row>
            <v-col v-for="n in 3" :key="n" cols="auto">
              <v-card :elevation="4" height="80" width="80" class="secondary"> </v-card>
            </v-col>
          </v-row>
        </div>
        <div class="d-flex flex-column pa-4">
          <div class="mb-4">15:15</div>
          <v-row>
            <v-col v-for="n in 4" :key="n" cols="auto">
              <v-card :elevation="4" height="80" width="80" class="error"> </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import mapboxgl from "mapbox-gl";
// https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
// import theme
import "vue-slider-component/theme/default.css";

export default {
  components: {
    VueSlider,
  },
  data() {
    return {
      access_token:
        "pk.eyJ1Ijoibml0aWtvcm4iLCJhIjoiY2p6ZHR0Yjk0MDNxNDNncGhqbDk5M3ZpaCJ9.FW231UaLDWmlgt3d7HQ1yg",
      map: {},
      searchKeyword: "#ม๊อบ 13 สิงหา",
      timeSlots: ["10 นาที", "30 นาที", "1 ชั่วโมง"],
      selectedTime: "10 นาที",
      tags: [
        { value: "130821", name_th: "ม๊อบ 13 สิงหา" },
        { value: "140821", name_th: "ป้าเป้า" },
        // { value: "150821", name_th: "คณะราษเปซ" },
      ],
      filter: [
        // { value: "violence", type: "violence", name_th: "ความรุนแรง" },
        { value: "protest", type: "violence", name_th: "การประท้วง" },
        { value: "arrest", type: "violence", name_th: "การจับกุม" },
        { value: "officer", type: "officer", name_th: "การกระทำของเจ้าหน้าที่" },
        { value: "mob", type: "mob", name_th: "การกระทำของผู้ชุมนุม" },
        { value: "etc", type: "etc", name_th: "อื่นๆ/ไม่ระบุ" },
      ],
      selectedFilter: [],
      slider: 0,
      sliderMax: 100,
      isPlaying: false,
      markerList: [
        [100.53826, 13.764981],
        [100.53914, 13.764921],
        [100.53816, 13.764921],
        [100.53829, 13.764911],
      ],
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
        style: "mapbox://styles/mapbox/light-v10", // style URL
        center: [100.53826, 13.764981], // starting position [lng, lat]
        zoom: 15, // starting zoom
      });
      // this.map = new longdo.Map({
      //   placeholder: document.getElementById("map"),
      // });
      this.createMarker();
    },
    createMarker() {
      // this.markerList.forEach(element => {
      //   console.log(element[0])
      //   const marker1 = new mapboxgl.Marker().setLngLat([100.53826, 13.764981]).addTo(this.map);
      // });
    },
    toggleIsPlay() {
      const self = this;
      self.isPlaying = !self.isPlaying;
      if (self.isPlaying && self.slider === self.sliderMax) {
        self.playInterval = setInterval(() => {
          self.slider += 1;
        }, 300);
      } else if (self.isPlaying && self.slider !== self.sliderMax) {
        self.playInterval = setInterval(() => {
          self.slider += 1;
        }, 300);
      } else {
        clearInterval(self.playInterval);
      }
    },
  },
};
</script>

<style>
.main-row, .map-area, .search-area  {
  height: 100%;
}
.search-area {
  z-index: 1000;
}
#map {
  width: 100%;
  height: 800px;
}
.mapboxgl-ctrl-bottom-right {
  display: none;
}
.top-menu {
  /* height: 40%; */
  height: 300px;
}
.bottom-menu {
  /* height: 60%; */
  height: calc(100% - 300px);
}
.v-messages,
.v-text-field__details {
  display: none !important;
}
.search-area,
.top-menu {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;
}
.timeline-area {
  position: absolute;
  bottom: 50px;
  left: 20px;
}
.time-slider {
  width: 100%;
  display: flex;
  justify-self: center;
  align-items: center;
}
</style>
