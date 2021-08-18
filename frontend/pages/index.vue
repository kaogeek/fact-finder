<template>
  <v-row class="main-row">
    <v-col class="map-area pa-0" cols="12" sm="8" md="8">
      <div id="map"></div>
      <div class="timeline-area">
        <v-row>
          <v-col>
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
                  label="Picker in menu"
                  prepend-icon="mdi-calendar"
                  readonly
                  solo
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" no-title scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
                <v-btn text color="primary" @click="$refs.menu.save(date)"> OK </v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col>
            <b>ตั้งแต่เวลา</b>
            <v-select
              v-model="selectedStartTime"
              :items="time"
              label="คำค้นหา"
              solo
            ></v-select>
          </v-col>
          <v-col>
            <b>ถึงเวลา</b>
            <v-select
              v-model="selectedEndTime"
              :items="time"
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
              disabled
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="5" md="5">
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
                    v-for="n in Math.floor(Math.random() * 6) + 1"
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
  </v-row>
</template>

<script>
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
      searchKeyword: "#ม๊อบ 16 สิงหา",
      timeSlots: ["10 นาที", "30 นาที", "1 ชั่วโมง"],
      selectedTime: "10 นาที",
      selectedStartTime: "15:00",
      selectedEndTime: "16:00",
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
      selectedFilter: ["protest", "arrest", "officer", "mob", "etc"],
      slider: 0,
      sliderMax: 100,
      isPlaying: false,
      time: ["15:00", "15:05", "15:10", "15:20", "15:30", "15:40"],
      markerList: [
        [100.53826, 13.764981],
        [100.53914, 13.764921],
        [100.53816, 13.764921],
        [100.53829, 13.764911],
        [100.537566, 13.763655],
        [100.537641, 13.763916],
        [100.537556, 13.764093],
      ],
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
        {
          id: "5",
          time: "15.55",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "แยกดินแดง",
        },
        {
          id: "6",
          time: "16.15",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "ห้าแยกลาดพร้าว",
        },
        {
          id: "7",
          time: "17.00",
          img: [
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
            "https://www.prachachat.net/wp-content/uploads/2020/10/S__136388620-728x485.jpg",
          ],
          place: "ห้าแยกลาดพร้าว",
        },
      ],
    };
  },
  mounted() {
    this.createMap();
    this.getData();
  },
  methods: {
    getData() {
      db.collection("records")
      .get()
      .then(querySnapshot => {
        // According to QuerySnapshot: https://firebase.google.com/docs/reference/js/firebase.firestore.QueryDocumentSnapshot
        // querySnapshot.docs is an array of QueryDocumentSnapshot: https://firebase.google.com/docs/reference/js/firebase.firestore.QueryDocumentSnapshot
        // To get data from query result, we've to call docSnapshot.data().
        var feed = querySnapshot.docs.map(docSnapshot => docSnapshot.data())

        // This is an array of firestore [`records`]
        this.feedData = feed;
      })
    },
    createMap() {
      mapboxgl.accessToken = this.access_token;
      this.map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/mapbox/light-v10", // style URL
        center: [100.53826, 13.764981], // starting position [lng, lat]
        zoom: 15, // starting zoom
      });
      // this.createMarker();
    },
    createMarker() {
      this.markerList.forEach((element) => {
        console.log(element[0]);
        const marker1 = new mapboxgl.Marker()
          .setLngLat([element[0], element[1]])
          .addTo(this.map);
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
  },
  watch: {
    feedData: function (data) {
      if (!data) {
        alert('Feed Data is unavailable!');
      }

      if (!Array.isArray(data)) {
        // If the returned data is not an array,
        // wrap it into array automatically!
        data = [data];
      }

      for (var val of data) {
        // create the popup
        const popup = new mapboxgl.Popup().setHTML(
          'reference: ' + val.referenceUrl +
          '</br><img class="img-popup" src="' + val.mediaUrl +'">'
        );

        const marker1 = new mapboxgl.Marker()
          .setLngLat([val.coordinates._long, val.coordinates._lat])
          .setPopup(popup)
          .addTo(this.map);
      }
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
  z-index: 1000;
}
#map {
  width: 100%;
  height: 100%;
}
/* .mapboxgl-ctrl-bottom-right {
  display: none;
} */
.top-menu {
  /* height: 20%; */
  height: 300px;
}
.bottom-menu {
  height: calc(100% - 300px);
  overflow-y: scroll;
  overflow-x: none;
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
</style>
