/**
 * 지도 조회
 *
 * @property {number} height            지도가 삽입될 div 높이 -- 아직 미적용
 * @property {number} init-lat          위도
 * @property {number} init-lng          경도
 * @property {number} init-level        지도 확대 수준
 * @property {String} init-class        지도가 삽입될 class 명
 *
 * 사용 예)
 *  지도가 들어갈 위치에 태그 사용
 *  <map :height=1000  :lat=37.51153264958647  :lng=127.02155677951492 :level=18 ref={refName}>
 *
 * 지도 내용 변경 시 호출 함수 내용
 *
 * relocationMap()
 *
 * 현재 lat과 lng 값을 기준으로 지도의 중심값 이동
 *
 * setMarkerOnMap(p1)
 *
 * 현재 lat과 lng 값을 기준으로 지도의 중심값을 이동시키고, p1에 담긴 좌표값들에 각각 마커 표시
 *
 * setMarkerWithInfoOnMap(p1)
 *
 * 현재 lat과 lng 값을 기준으로 지도의 중심값을 이동시키고, p1에 담긴 좌표값들에 클릭 시 infowindow가 출력되는 마커 표시
 *
 * setMarkerWithEventOnMap(p1)
 *
 * 현재 lat과 lng 값을 기준으로 지도의 중심값을 이동시키고, p1에 담긴 좌표값들에 클릭 시 eventBus.$emit()이 발생되는 마커 표시
 *  +) type1: 기본으로 표시될 마커의 아이콘, type2: 변경될 마커의 아이콘
 *
 */
import { eventBus } from "../eventBus.js";

Vue.component("map-view", {
    template: '\
        <div :class="this.className" style="background-color:lightgray; height:912px">\
        </div>\
    ',
    created: function(){
        this.initialize();
    },
    mounted: async function () {
        this.initMap();
        console.log("map mounted");

        this.lat = 37.51153264958647;
        this.lng = 127.02155677951492;
        this.level = 18;
    },
    props: {
        height: {
            type: Number,
            default: 1000,
        },
        initLat: {
            type: Number,
            // default: 37.51153264958647,
        },
        initLng: {
            type: Number,
            // default: 127.02155677951492,
        },
        initLevel: {
            type: Number,
            // default: 18,
        },
        initClass: {
            type: String,
            default: "map"
        }
    },
    data: function () {
        return {
            lat: this.initLat,
            lng: this.initLng,
            level: this.initLevel,
            className: this.initClass,
            MAP_API_KEY: "AIzaSyCsR76nGmEmwDE_y-x_zzvxL2jfnH3gvdA",
            GEOCODE_API_KEY: "AIzaSyAgCVw-kaIESsGh_U0FpmXqoqJo7r0TjWY",
            CALLBACK_NAME: "initMap",
            iconBase: "https://developers.google.com/maps/documentation/javascript/examples/full/images/",
            initialized: !!window.google,
            lib: {
                maps: {},
            },
            map: null,
            icons: {
                // 거점 POIs
                station: "images/ico_36_pin_select.svg",
                selectedStation: "images/ico_36_pin_position.svg",
                // 차량상태정보POIs
                carDrive: "images/ico_36_poi_drive.svg", //운행중
                carBusiness: "images/ico_36_poi_business.svg", //업무용
                carEmergency: "images/ico_36_poi_emergency.svg", //응급
                carPause: "images/ico_36_poi_pause.svg", //일시정지
                carReady: "images/ico_36_poi_ready.svg", //준비중
                carRepair: "images/ico_36_poi_repair.svg", //수리중
                carWaiting: "images/ico_36_poi_waiting.svg", //예약대기
            },
            markers: [],
            carMarkers: [],
            stationMarkers: []
        };
    },

    watch: {
        initLat: function (newVal) {
            this.lat = newVal;
        },

        initLng: function (newVal) {
            this.lng = newVal;
        },

        initLevel: function (newVal) {
            this.level = newVal;
        },
        initClass: function(newVal){
            this.className = newVal;
        }
    },
    methods: {
        initPromise: function (data) {
            return new Promise((resolve, reject) => {
                resolve(data);
            });
        },
        initialize: function () {
            if (this.initialized) return;
            this.initialized = true;

            window[this.CALLBACK_NAME] = () =>
                this.initPromise(window.google)
                    .then((result) => {
                        // this.lib = result;
                        this.initMap();
                    })
                    .catch(function (result) {
                        console.log(result);
                    });
            const script = document.createElement("script");
            script.async = true;
            script.defer = true;
            script.id = "map-script";
            script.src = "https://maps.googleapis.com/maps/api/js?key=" + this.MAP_API_KEY + "&callback=" + this.CALLBACK_NAME + "&region=kr";

            document.querySelector("head").appendChild(script);

        },
        initMap: async function () {
            this.mounted = true;
            if (this.lat == null) {
                this.lat = 37.51153264958647;
            }

            if (this.lng == null) {
                this.lng = 127.02155677951492;
            }

            if (this.level == null) {
                this.level = 18;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            try {
                var defaultLocation = { lat: this.lat, lng: this.lng };
                this.map = await new google.maps.Map(document.querySelector("."+this.className), {
                    zoom: this.level,
                    center: defaultLocation,
                    disableDefaultUI: true,
                });
            } catch (e) {
                console.log(e);
            }
        },
        relocateMap: function () {
            if (this.markers.length > 0) {
                this.deleteAllMarker();
            }
            if (this.lat > 85 || this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            try {
                var location = { lat: this.lat, lng: this.lng };
                this.map.setCenter(location);
            } catch (e) {
                console.log(e);
            }
        },
        setMarkerOnMap: function (p1) {
            if (this.markers.length > 0) {
                this.deleteAllMarker();
            }
            var centerLocation = { lat: this.lat, lng: this.lng };

            if (this.lat > 85 || this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            this.map.setCenter(centerLocation);

            for (let i = 0; i < p1.length; i++) {
                const marker = new google.maps.Marker({
                    position: p1[i],
                    icon: this.icons["parking"].icon,
                    map: this.map,
                });
                this.markers.push(marker);
            }
        },
        setMarkerWithInfoOnMap: function (p1) {
            if (this.markers.length > 0) {
                this.deleteAllMarker();
            }

            var centerLocation = { lat: this.lat, lng: this.lng };

            if (this.lat > 85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            } else if (this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            this.map.setCenter(centerLocation);

            for (let i = 0; i < p1.length; i++) {
                const contentString = p1[i].content;

                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });

                const marker = new google.maps.Marker({
                    position: p1[i],
                    map: this.map,
                });
                marker.addListener("click", () => {
                    infowindow.open(map, marker);
                });
                this.markers.push(marker);
            }
        },
        setMarkerWithEventOnMap: function (p1) {
            if (this.markers.length > 0) {
                this.deleteAllMarker();
            }
            var centerLocation = { lat: this.lat, lng: this.lng };

            if (this.lat > 85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            } else if (this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            this.map.setCenter(centerLocation);

            for (let i = 0; i < p1.length; i++) {

                const contentString = p1[i].content;

                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });

                const marker = new google.maps.Marker({
                    position: p1[i],
                    icon: this.icons[p1[i].type1],
                    map: this.map,
                });

                marker.addListener("click", () => {
                    eventBus.$emit(p1[i].callback, p1[i]);
                    marker.setIcon(this.icons[p1[i].type2]);
                    infowindow.open(this.map, marker);
                });
                this.markers.push(marker);
            }
        },
        setCarMarkers: function(p1, flag) {
            if (this.carMarkers.length > 0) {
                this.deleteCarMarker();
            }

            var centerLocation = { lat: this.lat, lng: this.lng };

            if (this.lat > 85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            } else if (this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            this.map.setCenter(centerLocation);

            for (let i = 0; i < p1.length; i++) {

                let contentString = p1[i].content;

                if(flag){
                    let address = this.convertLatlngToAddress(p1[i].lat, p1[i].lng);
                    contentString = contentString.concat("<br>("+address+")");
                }
                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });

                const marker = new google.maps.Marker({
                    position: p1[i],
                    icon: this.icons[p1[i].type1],
                    map: this.map
                });

                marker.addListener("click", () => {
                    eventBus.$emit(p1[i].callback, p1[i]);
                    marker.setIcon(this.icons[p1[i].type2]);
                    infowindow.open(this.map, marker);
                });
                this.carMarkers.push(marker);
            }

        },
        setStationMarkers: function(p1) {

            if (this.stationMarkers.length > 0) {
                this.deleteStationMarker();
            }

            var centerLocation = { lat: this.lat, lng: this.lng };

            if (this.lat > 85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            } else if (this.lat < -85) {
                const latError = new Error("위도 값이 허용범위를 벗어났습니다.");
                alert(latError);
                return;
            }

            if (this.level < 6) {
                this.level = 6;
            } else if (this.level > 20) {
                this.level = 20;
            }

            this.map.setCenter(centerLocation);

            for (let i = 0; i < p1.length; i++) {

                const contentString = p1[i].content;
                let deviceCnt = '0';
                if(p1[i].deviceCnt != null){
                    deviceCnt = String(p1[i].deviceCnt);
                }

                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });

                const marker = new google.maps.Marker({
                    position: p1[i],
                    icon: this.icons[p1[i].type1],
                    map: this.map,
                    label: {
                        text:deviceCnt
                    }
                });

                marker.addListener("click", () => {
                    eventBus.$emit(p1[i].callback, p1[i]);
                    marker.setIcon(this.icons[p1[i].type2]);
                    infowindow.open(this.map, marker);
                });

                this.stationMarkers.push(marker);
            }
        },
        deleteAllMarker: function() {

            if(this.markers != null){
                for (let i = 0; i < this.markers.length; i++) {
                    this.markers[i].setMap(null);
                }
            }

            if(this.carMarkers != null){
                for (let i = 0; i < this.carMarkers.length; i++) {
                    this.carMarkers[i].setMap(null);
                }
            }

            if(this.StationMarker != null){
                for (let i = 0; i < this.StationMarker.length; i++) {
                    this.StationMarker[i].setMap(null);
                }
            }

            this.markers = [];
            this.carMarkers = [];
            this.StationMarker = [];
        },

        deleteMarkers: function(){

            if(this.markers != null){
                for (let i = 0; i < this.markers.length; i++) {
                    this.markers[i].setMap(null);
                }
            }

            this.markers = [];
        },
        deleteCarMarker: function(){

            if(this.carMarkers != null){
                for (let i = 0; i < this.carMarkers.length; i++) {
                    this.carMarkers[i].setMap(null);
                }
            }

            this.carMarkers = [];
        },
        deleteStationMarker: function(){

            if(this.StationMarker != null){
                for (let i = 0; i < this.StationMarker.length; i++) {
                    this.StationMarker[i].setMap(null);
                }
            }

            this.StationMarker = [];
        },
        convertLatlngToAddress: function(lat, lng) {

            var geocode = "https://maps.googleapis.com/maps/api/geocode/json?&sensor=false&language=ko&key="+this.GEOCODE_API_KEY;

            let result;

            geocode = geocode.concat("&latlng="+lat+", "+lng);

            $.ajax({
                url:geocode,
                dataType:'json',
                async:false,
                success:function(data){
                    result = data.results[0].formatted_address;
                }
            });

            return result;
        }
    },
});
