// CLOCK
function displayTime() {
  var dateTime = new Date();
  var hrs = dateTime.getHours();
  var min = dateTime.getMinutes();
  var sec = dateTime.getSeconds();
  var session = document.getElementById('session');

  if (hrs >= 12) {
    session.innerHTML = 'PM';
  } else {
    session.innerHTML = 'AM';
  }

  if (hrs > 12) {
    hrs = hrs - 12;
  }

  document.getElementById('hours').innerHTML = hrs;
  document.getElementById('minutes').innerHTML = min;
  document.getElementById('seconds').innerHTML = sec;
}

// calls the displaytime function every 10ms
setInterval(displayTime, 10);


// MAP - GOOGLE MAP API 
const API_KEY = 'AIzaSyCQhZ_L3NPnHDxKlcbPVrSaFYVtbrjW-mk';
var gMap;
var gMarkers = []

function initMap(lat = 32.0555, lng = 34.8854) {
  return _connectGoogleApi()
    .then(() => {
      gMap = new google.maps.Map(
        document.querySelector('#map'), {
        center: { lat, lng },
        zoom: 10
      })
    })
}

// init map call
window.onload = onInit;

function onInit() {
  initMap()
    .then(() => {
      console.log('Map is ready');
    })
    .catch(() => console.log('Error: cannot init map'));
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve()

  var elGoogleApi = document.createElement('script');
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
  elGoogleApi.async = true;
  document.body.append(elGoogleApi);
  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve;
    elGoogleApi.onerror = () => reject('Google script failed to load')
  })
}

function clearOverlays() {
  for (var i = 0; i < gMarkers.length; i++ ) {
    gMarkers[i].setMap(null);
  }
  gMarkers.length = [];
}


// MARKERS
function addMarker(lat, lng, reg = "place") {
  const image = "plane.png";
  var marker = new google.maps.Marker({
    position: {lat, lng},
    map: gMap, // on what to put the marker
    title: reg, // what to put above of the plane if you stand on it
    icon: image
  });
  gMarkers.push(marker)
  google.maps.event.addListener(marker,"click",function(){});
  return marker;
}

function showMarkers(locs) {
  locs.forEach(({ reg, lat, lng }) => {
    addMarker(lat, lng , reg)
  })
}

const socket = io('http://localhost:3004', {
  transports: ["websocket", "polling"],
  attempts: 2
});


let to_fly
let to_land
let planes = []

socket.on('flights', function (data) {

  // data return as a string so e need to convert it to JSON file
  data_json =  JSON.parse(data)
  
   // data of flight that needs to fly 
   to_fly = data_json[0].wait_to_fly_of
   let flight_to_fly = "טיסות ממתינות להמראה : " + to_fly.toString()

   // connect the data to a button
   document.getElementById('dropbtn_').innerText = flight_to_fly

   // data of flights that needs to land
   to_land = data_json[0].wait_to_land
   let flight_to_land = "טיסות ממתינות לנחיתה : " + to_land.toString()

   document.getElementById('dropbtn2_').innerText = flight_to_land

   // taking the delay of flights
   let reg = data_json[0].fly_of[0][0]
   let delay = data_json[0].fly_of[0][1]
   let delay_status = "" 
   if(delay == 'null' || delay <=15)
   {
      delay_status = "normal"
   }
   else
   {
      delay_status = "late"
   }
   document.getElementById('to_fly_1').innerText = reg + " " + delay_status

   let reg_ = data_json[0].land[0][0]
   let delay_ = data_json[0].land[0][1]
   let delay_status_ = "" 
   if(delay_ == 'null' || delay_ <15)
   {
      delay_status_ = "valid"
   }
   else if(delay_ >15 && delay_ <60)
   {
      delay_status_ = "small delay"
   }
   else
   {
    delay_status_ = "big delay"
   }
   document.getElementById('to_land_1').innerText = reg_ + " " + delay_status_
   planes = []
   clearOverlays();
   // Creating arryay of planes that each plane contains his reg-number, his lat and lng. 
   for (const item in data_json) {
    if(data_json[item].day_type != undefined)
    {
      console.log(data_json[item].day_type)

    }
     let plane = {
       reg: data_json[item].real_time_flight.reg_number,
       lat: data_json[item].real_time_flight.lat,
       lng: data_json[item].real_time_flight.lng
     }
     planes.push(plane)
   }
   showMarkers(planes)
});

