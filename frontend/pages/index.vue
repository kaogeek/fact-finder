<template>
  <v-row class="main-row ma-0">
    <!-- Map Area -->
    <!-- <v-card v-show="tab === 0" class="logo" dark
      >Fact Finder (ช่วงพัฒนา)</v-card
    > -->
    <v-col
      v-show="tab === 0 || isMobile === false"
      class="map-area pa-0"
      cols="12"
      sm="8"
      md="8"
    >
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
          <v-btn :color="'rgba(25, 118, 210, 1)'" dark depressed fab>
            <v-icon large>{{ isPlaying ? "mdi-pause" : "mdi-play" }}</v-icon>
          </v-btn>
          <vue-slider
            class="slider-line ml-4"
            height="10px"
            width="100%"
            v-model="value_1"
          ></vue-slider>
        </div>
      </div>
    </v-col>

    <!-- Search Area -->
    <v-col
      v-show="tab === 1 || isMobile === false"
      class="search-area pa-0"
      cols="12"
      sm="4"
      md="4"
    >
      <!-- Top Search Bar -->
      <div class="top-menu pl-3 pr-3 pt-6">
        <p><b>ภาพเหตุการณ์ในบริเวณนี้</b></p>
        <v-row>
          <v-col cols="6" sm="7" md="7">
            <!-- <v-text-field
              v-model="searchKeyword"
              label="คำค้นหา"
              outlined
              clearable
              disabled
            ></v-text-field> -->
            <v-combobox
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
        <v-timeline align-top dense>
          <v-timeline-item
            v-for="item in timelineEvent"
            :key="item.id"
            color="pink"
            small
          >
            <v-row class="pt-1">
              <v-col cols="3">
                <div class="mb-3">
                  <strong>{{ item.time }} น.</strong>
                </div>
                <div class="d-flex flex-row">
                  <v-card
                    class="mr-4"
                    v-for="n in Math.floor(Math.random() * 3) + 1"
                    :key="n"
                    :elevation="4"
                    height="80"
                    width="80"
                  >
                    <v-img :src="item.img[0]" height="100%"></v-img>
                  </v-card>
                </div>
              </v-col>
              <v-col>
                <strong></strong>
                <div>{{ item.place }}</div>
              </v-col>
            </v-row>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-col>

    <!-- Footer menu desktop -->
    <v-tabs
      v-show="isMobile === true"
      v-model="tab"
      background-color="black accent-4"
      height="72"
      centered
      dark
      icons-and-text
      class="footer-menu"
    >
      <v-tabs-slider></v-tabs-slider>

      <v-tab>
        Map
        <v-icon>mdi-map</v-icon>
      </v-tab>

      <v-tab>
        Timeline
        <v-icon>mdi-timeline</v-icon>
      </v-tab>
    </v-tabs>
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
import firebase from "firebase/app";

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
      feedData: {},
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      menu: false,
      searchKeyword: ["#ม๊อบ 18 สิงหา"],
      search: null,
      timeSlots: ["10 นาที", "30 นาที", "1 ชั่วโมง"],
      selectedTime: "10 นาที",
      typeDataList: ["exif", "reporter", "source"],
      startTime: "15:00",
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
      value_1: [0, 100],
      sliderMax: 100,
      isPlaying: false,
      isMobile: false,
      tab: 0,
      timelineEvent: [
        {
          id: "1",
          time: "15.00",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "ราชประสงค์",
        },
        {
          id: "2",
          time: "15.15",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "สนามหลวง",
        },
        {
          id: "3",
          time: "15.30",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "อนุสาวรีย์ประชาธิปไตย",
        },
        {
          id: "4",
          time: "15.45",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "อนุสาวรีย์ประชาธิปไตย",
        },
      ],
    };
  },
  created() {
    if (screen.width <= 760) {
      this.isMobile = true;
      console.log(this.isMobile);
      // return true;
    } else {
      this.isMobile = false;
      // return false;
      console.log(this.isMobile);
    }
  },
  mounted() {
    this.createMap();
    // this.getData();
  },
  methods: {
    getData() {
      db.collection("env/dev/records")
        .get()
        .then((querySnapshot) => {
          // According to QuerySnapshot: https://firebase.google.com/docs/reference/js/firebase.firestore.QueryDocumentSnapshot
          // querySnapshot.docs is an array of QueryDocumentSnapshot: https://firebase.google.com/docs/reference/js/firebase.firestore.QueryDocumentSnapshot
          // To get data from query result, we've to call docSnapshot.data().
          var feed = querySnapshot.docs.map((docSnapshot) =>
            docSnapshot.data()
          );

          // This is an array of firestore [`records`]
          this.feedData = feed;
          console.log(feed);
        });
    },
    createMap() {
      mapboxgl.accessToken = this.access_token;
      this.map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/mapbox/light-v10", // style URL
        center: [100.53826, 13.764981], // starting position [lng, lat]
        zoom: 15, // starting zoom
      });
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
    madeData(data) {
      for (var val of data) {
        if (val.coordinates["exif"] !== null) {
          // create the popup
          const popup = new mapboxgl.Popup().setHTML(
            "ref: " +
              val.referenceUrl +
              '</br><img class="img-popup" src="' +
              val.mediaUrl +
              '">'
          );
          console.log(val);
          const marker1 = new mapboxgl.Marker()
            .setLngLat([
              val.coordinates["exif"]._long,
              val.coordinates["exif"]._lat,
            ])
            .setPopup(popup)
            .addTo(this.map);
        } else {
          console.log("Not found location");
        }
        console.log(val.coordinates["exif"]);
        // var date = new Date(val.timestamp.seconds * 1000);
        // var hours = date.getHours();
        // var minutes = "0" + date.getMinutes();
        // var seconds = "0" + date.getSeconds();
        // // Will display time in 10:30:23 format
        // var formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
        // console.log(date.getDate());
        // console.log(formattedTime);
      }
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
    typeDataList: function (val) {},
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
}
.bottom-menu {
  height: calc(100% - 300px);
  overflow-y: scroll;
  box-sizing: border-box;
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

@media only screen and (max-width: 600px) {
  .map-area {
    height: calc(100% - 72px);
  }
  .search-area {
    height: 100%;
  }
  .bottom-menu {
    height: calc(100% - 372px);
  }
  .timeline-area {
    bottom: 120px;
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
