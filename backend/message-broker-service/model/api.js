const airlines = require("./airlines");
const airports = require("./airports");
const axios = require('axios').default;

const fs = require('fs');

let api_counter = 0;
let API_BLOCKER = 5;

let schedule_arrivals = "https://airlabs.co/api/v9/schedules?arr_iata=TLV&api_key=" + process.env.API_KEY_AIR_LAB
let schedule_departures = "https://airlabs.co/api/v9/schedules?dep_iata=TLV&api_key=" + process.env.API_KEY_AIR_LAB
let real_time_flight_arrivals = "https://airlabs.co/api/v9/flights?arr_iata=TLV&api_key=" + process.env.API_KEY_AIR_LAB
let real_time_flight_departures = "https://airlabs.co/api/v9/flights?dep_iata=TLV&api_key=" + process.env.API_KEY_AIR_LAB
let weather_in_tel_aviv = "http://api.openweathermap.org/data/2.5/weather?q=tel%20aviv,il&APPID=" + process.env.API_KEY_OPENWETHER


function isOnQuarterTime(date_utc_str) {
  let date_utc = new Date(date_utc_str)
  let curr_date_utc = new Date(new Date().toUTCString())
  if (Math.abs(curr_date_utc.getTime() - date_utc.getTime()) / (1000 * 60) < 15) {
    return true
  }
  return false
}

function is_hag(date) {
  let hebrew_event = "https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&start=" + date +
    "&end=" + date +
    "&mf=on&c=on&geo=geoname&s=on"
  axios.get(hebrew_event)
    .then(function (response) {
      if (response.data.items.length != 0) {
        return true
      }
      return false
    })
    .catch(function (error) {
      console.log(error);
    })
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

let dates = {}

function get_day_type(date_schedule) {
  let day_type = 'normal'
  if (date_schedule.getMonth() >= 6 && date_schedule.getMonth() <= 7) {
    day_type = 'summer holliday'
  }
  if (!Object.keys(dates).includes(date_schedule.getDate().toString())) {
    if (is_hag(formatDate(date_schedule))) {
      dates[date_schedule.getDate()] = 'hag'
      day_type = 'hag'
    }
    else {
      dates[date_schedule.getDate()] = 'normal'
    }
  }
  else {
    return dates[date_schedule.getDate()]
  }
  return day_type
}

function getAirlineByIata(iata) {
  for (var i = 0; i < airlines.length; i++) {
    if (airlines[i].code == iata) {
      return airlines[i].name
    }
  }
}

function getCountryByAirportIata(iata) {
  for (var i = 0; i < airports.length; i++) {
    if (airports[i].code == iata) {
      return airports[i].country
    }
  }
}

function getDelayStatus(arrival_time, estimated_arrival_time) {
  const diff_in_minutes = Math.abs(arrival_time.getTime() - estimated_arrival_time.getTime()) / (1000 * 60)
  if (diff_in_minutes < 15) {
    return 'valid'
  } else if (diff_in_minutes < 60) {
    return 'small delay'
  }
  return 'big delay'
}

function getLatLongByAirportIata(iata) {
  for (var i = 0; i < airports.length; i++) {
    if (airports[i].code == iata) {
      return [airports[i].lat, airports[i].lon]
    }
  }
}

function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371
  var dLat = toRad(lat2 - lat1)
  var dLon = toRad(lon2 - lon1)
  var lat1 = toRad(lat1)
  var lat2 = toRad(lat2)

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  return d
}

function toRad(Value) {
  return Value * Math.PI / 180
}

function getFlightStatus(distance) {
  if (distance < 1500) {
    return 'short'
  } else if (distance < 3500) {
    return 'middle'
  }
  return 'long'
}

function getWeatherUrlByLatLon(lat, lon) {
  return weather_url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +
    "&lon=" + lon +
    "&appid=" + process.env.API_KEY_OPENWETHER
}

async function generateFLights (callback) {
  console.log("Generating new calls.")
  axios.all([axios.get(schedule_arrivals), axios.get(schedule_departures),
  axios.get(real_time_flight_arrivals), axios.get(real_time_flight_departures),
  axios.get(weather_in_tel_aviv)]).then(axios.spread((...responses) => {
    let schedules = [...responses[0].data.response, ...responses[1].data.response]
    let real_time_flights = [...responses[2].data.response, ...responses[3].data.response]
    let weather = responses[4].data
    let for_intelligence = []
    let for_storage = []
    let wait_to_fly_of = 0
    let fly_of = []
    let wait_to_land = 0
    let land = []
    let index2 = 0;
    for (let [index, schedule] of schedules.entries()) {
      index2 ++
      if (schedule['status'] == 'scheduled' && isOnQuarterTime(schedule['dep_time_utc'])) {
        // console.log(schedule['flight_iata'])
        // console.log(schedule['delayed'])
        fly_of.push([schedule['flight_iata'], schedule['delayed']])
        wait_to_fly_of++
      }
      if (schedule['status'] == 'active' && isOnQuarterTime(schedule['arr_time_utc'])) {
        // console.log(schedule['flight_iata'])
        // console.log(schedule['delayed'])
        land.push([schedule['flight_iata'], schedule['delayed']])
        wait_to_land++
      }
      let date_schedule = new Date(schedule['dep_time_utc'])
      const latLon1 = getLatLongByAirportIata(schedule['dep_iata'])
      const latLon2 = getLatLongByAirportIata(schedule['arr_iata'])
      if (!(latLon1 && latLon2)) {
        continue
      }

      // if (api_counter > API_BLOCKER) {
      //   continue;
      // }
      // api_counter++

      const flight_distance = calcCrow(...latLon1, ...latLon2)

      leaving_country = getCountryByAirportIata(schedule['dep_iata'])
      landing_country = getCountryByAirportIata(schedule['arr_iata'])
    
      let leaving_weather = ''
      let landing_weather = ''
      let url = ''

      if (leaving_country == 'Israel') {
        leaving_weather = weather
        url = getWeatherUrlByLatLon(...getLatLongByAirportIata(schedule['arr_iata']))
      }
      else {
        landing_weather = weather
        url = getWeatherUrlByLatLon(...getLatLongByAirportIata(schedule['dep_iata']))
      }
      axios.get(url).then(response => {
        if (leaving_country == 'Israel') {
          landing_weather = response.data
        } else {
          leaving_weather = response.data
        }
        // console.log(leaving_weather)
        for_storage.push(
          {
            day_type: get_day_type(date_schedule),
            month: date_schedule.getMonth() + 1,
            day: date_schedule.getDate(),
            company: getAirlineByIata(schedule['airline_iata']),
            leaving_country: leaving_country,
            landing_country: landing_country,
            flight_type: getFlightStatus(flight_distance),
            leaving_weather: "clear",
            landing_weather: landing_weather,
            delay_status: getDelayStatus(new Date(schedule['arr_time_utc']), new Date(schedule['arr_estimated_utc']))
          }
        )
        // console.log(leaving_weather)
      // console.log('index : ' + index)
      // console.log('schedule : ' + schedules.length)
      // console.log('index2 : ' + index2)
      if (index2 == schedules.length)
      {
        let data = JSON.stringify(for_storage);
        fs.writeFileSync('for_storage.json', data);
        console.log("for_storage")
        index2 = 0;
        callback(for_storage)
      }
      }).catch(errors => {
        console.log("errors" + errors)
      })
    }
    for (const real_time_flight of real_time_flights) {
      for_intelligence.push(
        {
          real_time_flight: real_time_flight,
          wait_to_fly_of: wait_to_fly_of,
          wait_to_land: wait_to_land,
          weather: weather,
          land: land,
          fly_of: fly_of
        }
      )
    }
    let data = JSON.stringify(for_intelligence);
    fs.writeFileSync('for_intelligence.json', data);
    console.log("for_intelligence")
    callback(for_intelligence)
  })).catch(errors => {
    console.log("errors")
    console.log(errors)
  })
};

module.exports = {
  generateFLights,
};


