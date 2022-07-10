const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
'September', 'October', 'November', 'December'];

let weather = {
    "apiKey": "08cc2ae94f7d51b29a2b2e1e17bb6f60",
    fetchCurrentWeather: function (city) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q="
        + city
        + "&units=metric&appid="
        + this.apiKey)

        .then(response => response.json())
        .then(data => this.displayCurrentWeather(data));
    },
    fetchForecast: function (city){
        fetch("https://api.openweathermap.org/data/2.5/forecast?q="
        + city
        + "&units=metric&appid="
        + this.apiKey)
        .then(response => response.json())
        .then(data => this.displayForecast(data));
    },
    displayCurrentWeather: function (data){
        const { name, visibility, timezone } = data;
        document.body.style.backgroundImage = "url('https://source.unsplash.com/1920x1080/?" + name + "')";
        const { country, sunrise, sunset } = data.sys;
        const { icon, description } = data.weather[0];
        const { temp, feels_like, temp_min, temp_max, humidity } = data.main; 
        const { speed } = data.wind;
        const sunriseConverted = convertFromUnixTime(sunrise, timezone);
        const sunsetConverted = convertFromUnixTime(sunset, timezone);
        displayCity(name, country);
        displayWeatherConditions(icon, description);
        displayTemp(temp, feels_like);
        displayOtherDetails(speed, temp_min, temp_max, humidity, sunriseConverted, sunsetConverted, visibility);
    },
    displayForecast: function (data){
        const { list } = data;
        let arr = [];

        for (let i = 0; i < list.length; i++){
            let { dt_txt } = list[i];
            let { temp_min, temp_max } = list[i].main;
            let { icon, description } = list[i].weather[0];
            
            dt_txt = dt_txt.substring(0, dt_txt.indexOf(" "));
            if (arr.filter(e => e.date === dt_txt).length == 0){
                arr.push({'date': dt_txt, 'temp_min': temp_min, 'temp_max': temp_max,
                'icon': icon, 'description': description});
            }
            else{
                const pos = arr.map(function(e) { return e.date; }).indexOf(dt_txt);
                if (arr[pos].temp_min > temp_min){
                    arr[pos].temp_min = temp_min;
                }
                if (arr[pos].temp_max < temp_max){
                    arr[pos].temp_max = temp_max;
                    arr[pos].icon = icon;
                    arr[pos].description = description;
                }
            }
        }

        if (arr.length > 5){
            if (isCurrentDate(arr)){
                arr.shift();
            }
            else{
                arr.pop();
            }
        }
        displayForecastIcon(arr);
        displayForecastDate(arr);
        displayForecastTemp(arr);
    }
}

const isCurrentDate = (arr) =>{
    const d = new Date();

    const dateArr = arr[0].date.split('-');
    const month = parseInt(dateArr[1] - 1);
    const day = parseInt(dateArr[2]);
    
    if (d.getMonth() === month && d.getDate() === day){
        return true;
    }
    else{
        return false;
    }
}

const displayForecastIcon = (arr)=>{
    for (let i = 0; i < arr.length; i++){
        const forecast = document.getElementById('forecast-weather-' + i);
        forecast.querySelector('.forecast-icon').src = "http://openweathermap.org/img/wn/" + arr[i].icon + "@4x.png";
        forecast.querySelector('.forecast-description').innerHTML = arr[i].description;
    }
}

const displayForecastDate = (arr) =>{
    for (let i = 0; i < arr.length; i++){
        const dateArr = arr[i].date.split('-');
        const month = months[parseInt(dateArr[1]) - 1];
        const forecast = document.getElementById('forecast-weather-' + i);
        forecast.querySelector('.date').innerHTML = month + ' ' + dateArr[2];
    };

}

const displayForecastTemp = (arr) =>{
    for (let i = 0; i < arr.length; i++){
        const forecast = document.getElementById('forecast-weather-' + i);
        forecast.querySelector('.forecast-temp').innerHTML = Math.round(arr[i].temp_max)
         + ' / '
         + Math.round(arr[i].temp_min);
    }
}

const displayCity = (city, country) =>{
    const cityDisplay = document.getElementById('city-name');
    cityDisplay.innerHTML = "Weather in " + city + ", " + country;
    if (cityDisplay.clientHeight > 46){
        cityDisplay.style.fontSize = '30px';
    }
    else{
        cityDisplay.style.fontSize = '40px';
    }
}

const displayWeatherConditions = (icon, description) =>{
    document.getElementById('icon').src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    document.getElementById('description').innerHTML = description;
}


function displayTemp(temp, feels_like){
    document.getElementById('temp').innerText = Math.round(temp);
    document.getElementById('temp-feels').innerText = Math.round(feels_like);
}

const displayOtherDetails = (wind_speed, temp_min, temp_max, humidity, sunrise, sunset, visibility) =>{
    document.getElementById('wind-speed').innerHTML = wind_speed + "km/h";
    document.getElementById('temp-min').innerHTML = temp_min;
    document.getElementById('temp-max').innerHTML = temp_max;
    document.getElementById('humidity').innerHTML = humidity + '%';
    document.getElementById('sunrise').innerHTML = sunrise;
    document.getElementById('sunset').innerHTML = sunset;
    document.getElementById('visibility').innerHTML = (visibility/1000) + "km";
}

const convertFromUnixTime = (unix_timestamp, timezone) =>{
    let date = new Date(unix_timestamp * 1000);
    let hour = (date.getHours() + (date.getTimezoneOffset() / 60));
    hour = (hour + (timezone/3600)) % 24;
    let meridiem;
    let min;
    let sec;

    if (hour <=  12){
        meridiem = "AM";
    }
    else{
        meridiem = "PM";
        hour = hour % 12;
    }

    if (('' + date.getMinutes()).length == 1){
        min = '0' + date.getMinutes();
    }
    else{
        min = date.getMinutes();
    }

    if (('' + date.getSeconds()).length == 1){
        sec = '0' + date.getSeconds();
    }
    else{
        sec = date.getSeconds();
    }

    return hour + ':' + min + ':' + sec + meridiem;
}

const getWeather = () =>{
    const city = document.getElementById('city-input').value;
    if (city.length != 0){
        weather.fetchCurrentWeather(city);
        weather.fetchForecast(city);
        document.getElementById('weather').style = 'height: 550px';
        document.getElementById('weather-info-display').classList.remove('hide');
        document.getElementById('forecast-container').classList.remove('hide');
    }
}
