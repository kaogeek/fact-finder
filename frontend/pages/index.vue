<template>
  <v-row class="main-row ma-0">
    <!-- Map Area -->
    <!-- <v-card v-show="tab === 0" class="logo" dark
      >Fact Finder (ช่วงพัฒนา)</v-card
    > -->
    <v-col class="map-area pa-0" cols="12" sm="8" md="8">
      <div id="map"></div>
      <div class="timeline-area">
        <v-row class="date-area">
          <div class="mr-4">
            <b>วันที่</b>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label=""
                  prepend-icon="mdi-calendar"
                  readonly
                  solo
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" no-title scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="menu = false">
                  Cancel
                </v-btn>
                <v-btn text color="primary" @click="$refs.menu.save(date)">
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
          </div>
          <div class="mr-4 d-flex flex-column justify-center">
            <b>ตั้งแต่เวลา</b>
            <vue-timepicker
              v-model="startTime"
              :minute-interval="10"
            ></vue-timepicker>
          </div>
          <div class="mr-4 d-flex flex-column justify-center">
            <b>ถึงเวลา</b>
            <vue-timepicker
              v-model="endTime"
              :minute-interval="10"
            ></vue-timepicker>
          </div>
        </v-row>
        <div class="time-slider">
          <v-btn @click="toggleIsPlay" :color="'rgba(25, 118, 210, 1)'" dark depressed fab>
            <v-icon large>{{ isPlaying ? "mdi-pause" : "mdi-play" }}</v-icon>
          </v-btn>
          <vue-slider
            class="slider-line ml-4"
            height="10px"
            width="100%"
            v-model="sliderValue"
          ></vue-slider>
        </div>
      </div>
    </v-col>

    <!-- Search Area -->
    <v-col class="search-area pa-0" cols="12" sm="4" md="4">
      <!-- Top Search Bar -->
      <div class="top-menu pl-3 pr-3 pt-6">
        <p><b>ภาพเหตุการณ์ในบริเวณนี้</b></p>
        <v-row>
          <v-col cols="6" sm="7" md="7">
            <v-combobox
              class="search-tag"
              v-model="searchKeyword"
              :items="tagsList"
              :search-input.sync="search"
              hide-selected
              hint="Maximum of 5 tags"
              label="เพิ่มคำค้น"
              multiple
              persistent-hint
              small-chips
              outlined
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      No results matching "<strong>{{ search }}</strong
                      >". Press <kbd>enter</kbd> to create a new one
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
          </v-col>
          <v-col cols="6" sm="5" md="5">
            <v-select
              v-model="selectedTime"
              :items="timeSlots"
              outlined
              disabled
              label="ความละเอียด"
            ></v-select>
          </v-col>
        </v-row>
        <div>
          <div>แท๊กสำคัญในวันนี้:</div>
          <v-chip v-for="item in tags" small :key="item.value" class="ma-2"
            >#{{ item.name_th }}</v-chip
          >
        </div>
        <div>แหล่งข้อมูล:</div>
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

      <!-- Bottom Search Bar -->
      <div class="bottom-menu pa-0">
        <v-timeline align-top dense v-if="feedData.length !== 0">
          <v-timeline-item
            v-for="item in feedData"
            :key="item.referenceUrl"
            color="pink"
            small
          >
            <v-row class="pt-1">
              <v-col cols="3">
                <div class="mb-3">
                  <strong
                    >{{
                      generateTime(item.timestamp["exif"].seconds)
                    }}
                    น.</strong
                  >
                </div>
                <div class="d-flex flex-row">
                  <v-card class="mr-4" :elevation="4" height="80" width="80">
                    <v-img :src="item.mediaUrl" height="100%"></v-img>
                  </v-card>
                </div>
              </v-col>
              <!-- <v-col>
                <strong></strong>
                <div>{{ item }}</div>
              </v-col> -->
            </v-row>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";
import mapboxgl from "mapbox-gl";
// https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
// import theme
import "vue-slider-component/theme/default.css";

import { db } from "~/plugins/firebaseConfig.js";

export default {
  components: {
    VueSlider,
    VueTimepicker,
  },
  data() {
    return {
      access_token:
        "pk.eyJ1Ijoibml0aWtvcm4iLCJhIjoiY2p6ZHR0Yjk0MDNxNDNncGhqbDk5M3ZpaCJ9.FW231UaLDWmlgt3d7HQ1yg",
      map: {},
      feedData: [],
      // date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      //   .toISOString()
      //   .substr(0, 10),
      date: "2021-08-21",
      menu: false,
      searchKeyword: ["#ม๊อบ 18 สิงหา"],
      search: null,
      timeSlots: ["10 นาที", "30 นาที", "1 ชั่วโมง"],
      selectedTime: "10 นาที",
      typeDataList: ["exif", "reporter", "source"],
      startTime: "00:00",
      endTime: "16:00",
      tags: [
        { value: "130821", name_th: "ม๊อบ 18 สิงหา" },
        { value: "140821", name_th: "ป้าเป้า" },
        { value: "150821", name_th: "คณะราษเปซ" },
      ],
      tagsList: ["#ม๊อบ 18 สิงหา", "ป้าเป้า", "ไฮโซลูกนัท", "ทะลุฟ้า"],
      filter: [
        { value: "people", type: "people", name_th: "People" },
        { value: "media", type: "media", name_th: "Media" },
        { value: "ngo", type: "ngo", name_th: "NGOs" },
        { value: "politician", type: "politician", name_th: "Politician" },
      ],
      selectedFilter: ["media", "ngo", "politician"],
      sliderValue: 0,
      sliderMax: 100,
      isPlaying: false,
      isMobile: false,
      tab: 0,
      mapMarkers: [],
    };
  },
  created() {},
  mounted() {
    this.createMap();
    // this.getTag();
    this.getDataFromDate(this.date, this.startTime, this.endTime);
  },
  methods: {
    getTag() {
      db.collection("env/dev/tags")
        .get()
        .then((ss) => {
          // this.tagsList = tags;
          console.log(ss);
        });
    },
    createMap() {
      mapboxgl.accessToken = this.access_token;
      this.map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/mapbox/light-v10", // style URL
        center: [100.53826, 13.764981], // starting position [lng, lat]
        zoom: 10, // starting zoom
      });
    },
    toggleIsPlay() {
      const self = this;
      self.isPlaying = !self.isPlaying;
      if (self.isPlaying && self.sliderValue === self.sliderMax) {
        clearInterval(self.playInterval);
        self.sliderValue = 0;
        // self.playInterval = setInterval(() => {
        //   self.sliderValue += 1;
        // }, 300);
      } else if (self.isPlaying && self.sliderValue !== self.sliderMax) {
        self.playInterval = setInterval(() => {
          self.sliderValue += 1;
        }, 300);
      } else {
        clearInterval(self.playInterval);
      }
    },
    madeData(data) {
      this.mapMarkers.forEach((marker) => marker.remove());
      this.mapMarkers = [];

      for (var val of data) {
        if (val.coordinates["exif"] !== null) {
          // create the popup
          const popup = new mapboxgl.Popup().setHTML(
            "เวลา: " +
              this.generateTime(val.timestamp["exif"].seconds) +
              '</br><img class="img-popup" src="' +
              val.mediaUrl +
              '">'
          );
          const marker = new mapboxgl.Marker()
            .setLngLat([
              val.coordinates["exif"]._long,
              val.coordinates["exif"]._lat,
            ])
            .setPopup(popup)
            .addTo(this.map);
          this.mapMarkers.push(marker);
        } else {
          console.log("Not found location");
        }
      }
    },
    getDataFromDate(date, start, end) {
      let startDate = new Date(date + " " + start);
      let endDate = new Date(date + " " + end);
      db.collection("env/dev/records")
        .where("timestamp.exif", ">", startDate)
        .where("timestamp.exif", "<", endDate)
        .orderBy("timestamp.exif")
        .get()
        .then((querySnapshot) => {
          var feed = querySnapshot.docs.map((docSnapshot) =>
            docSnapshot.data()
          );
          this.feedData = feed;
          console.log(this.feedData);
        });
    },
    generateTime(timestamp) {
      let date = new Date(timestamp * 1000);
      let hours = date.getHours();
      let minutes = "0" + date.getMinutes();
      let seconds = "0" + date.getSeconds();

      let formattedTime =
        hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

      return formattedTime;
    },
  },
  watch: {
    feedData: function (data) {
      if (!data) {
        alert("Feed Data is unavailable!");
      }

      if (!Array.isArray(data)) {
        // If the returned data is not an array,
        // wrap it into array automatically!
        data = [data];
      }
      this.madeData(data);
    },
    date: function (val) {
      this.getDataFromDate(val, this.startTime, this.endTime);
    },
    startTime: function (val) {
      this.getDataFromDate(this.date, val, this.endTime);
    },
    endTime: function (val) {
      this.getDataFromDate(this.date, this.startTime, val);
    },
  },
};
</script>

<style>
.main-row,
.map-area,
.search-area {
  height: 100%;
}
.search-area {
  display: flex;
  flex-direction: column;
  z-index: 1000;
}
#map {
  width: 100%;
  height: 100%;
}
.top-menu {
  height: 300px;
  box-sizing: border-box;
  z-index: -100;
}
.bottom-menu {
  height: calc(100% - 300px);
  overflow-y: scroll;
  box-sizing: border-box;
  z-index: -200;
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
.img-popup {
  height: 240px;
  width: 100%;
}
.vue__time-picker {
  background-color: white;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
    0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
  font-family: "Prompt", sans-serif !important;
}
.vue__time-picker input.display-time {
  border: unset !important;
}
.vue__time-picker-dropdown,
.vue__time-picker .dropdown {
  top: -161px;
}
.footer-menu {
  position: absolute;
  bottom: 0;
  height: 72px;
}
.slider-line {
  width: 820px;
}
.date-area {
  margin: 0px;
  z-index: 10000;
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
  z-index: 1000;
}
.search-tag {
  z-index: 10000;
}

@media only screen and (max-width: 600px) {
  .map-area {
    height: calc(100% - 120px);
  }
  .search-area {
    height: 100%;
  }
  .bottom-menu {
    height: calc(100% - 300px);
  }
  .timeline-area {
    bottom: 160px;
  }
  .slider-line {
    width: 220px !important;
  }
  .date-area {
    margin-bottom: 12px !important;
  }
  .logo {
    width: 100px;
    font-size: 12px;
    top: 10px;
    left: 10px;
  }
}
</style>
