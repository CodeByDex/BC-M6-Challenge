const weatherAPIKey = "8bddc3309748f00ebd0dade126b57ec6";

window.addEventListener("load", () => {
    document.querySelector("#City-Search").addEventListener("click", ClickedSearchButton);

    LoadSearchHistory();
});

async function ClickedSearchButton(event){
    const searchTextEL = event.target.parentNode.querySelector("input");
    
    let results = await GetForecastData(searchTextEL.value);

    AddCityToSearchHistory(searchTextEL.value);

    UpdateForecastInfo(results);
};

async function GetForecastData(searchText){
    let results = null;

    searchText = searchText.toLowerCase();

    results = CheckSessionForResults(searchText);

    if (results === null){
        results = await GetForecastFromAPI(searchText);

        if(results != null){
            AddResultsToSessionStorage(searchText, results);
        }
    }

    return results;    
};

function CheckSessionForResults(city){return null;};

//api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
async function GetForecastFromAPI(city){
    let lat, long;
    [lat, long] = await GetLatLongFromAPI(city);

    let results = {
        City: city,
        Forecast: []
    };

    let params = new URLSearchParams();

    params.append("lat", lat);
    params.append("lon", long);
    params.append("units", "metric");
    params.append("appid", weatherAPIKey);

    const response = await fetch("http://api.openweathermap.org/data/2.5/forecast?" + params.toString());

    if(!response.ok)
    {
        return results;
    }    

    let forecastData = await response.json();

    results.City = forecastData.city.name; 

    //Start at the most current available forecast and advance by 24 hours (8 * 3 Hours = 24)
    for (let index = 0; index < forecastData.list.length; index = index + 8) {
        results.Forecast.push({
            Date: new Date(forecastData.list[index].dt * 1000),
            Temp: forecastData.list[index].main.temp,
            Humidity: forecastData.list[index].main.humidity,
            Wind: forecastData.list[index].wind.speed
        })
    }

    //Since the last days forecast might not be available at an even 24 hours out, need to grab the last available forecast
    results.Forecast.push({
        Date: new Date(forecastData.list[forecastData.list.length - 1].dt * 1000),
        Temp: forecastData.list[forecastData.list.length - 1].main.temp,
        Humidity: forecastData.list[forecastData.list.length - 1].main.humidity,
        Wind: forecastData.list[forecastData.list.length - 1].wind.speed
    })

    return results;
};

//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
async function GetLatLongFromAPI(city){
    let results;

    let params = new URLSearchParams();

    params.append("q", city);
    params.append("Limit", 1);
    params.append("appid", weatherAPIKey);

    const response = await fetch("http://api.openweathermap.org/geo/1.0/direct?" + params.toString())
        
    if (response.ok){
        results = await response.json();
        return [results[0].lat, results[0].lon];
    }
};

function AddResultsToSessionStorage(city, results){};

function AddCityToSearchHistory(city){};

function UpdateForecastInfo(forecastData){
    const today = document.querySelector("#Day-Forecast");
    
    let todaysDetails = today.querySelectorAll("p span");
    let currentDay = forecastData.Forecast[0];

    today.querySelector("h2").textContent = forecastData.City + " (" + currentDay.Date.toLocaleDateString() + ")";
    todaysDetails[0].textContent = currentDay.Temp;
    todaysDetails[1].textContent = currentDay.Wind;
    todaysDetails[2].textContent = currentDay.Humidity;

    const forecastDays = document.querySelectorAll("#Short-Term-Forecast div");

    for (let index = 0; index < forecastDays.length; index++) {
        if (index+1 < forecastData.Forecast.length)
        {
            todaysDetails = forecastDays[index].querySelectorAll("p span");
            currentDay = forecastData.Forecast[index+1];

            forecastDays[index].querySelector("h4").textContent = currentDay.Date.toLocaleDateString();
            todaysDetails[0].textContent = currentDay.Temp;
            todaysDetails[1].textContent = currentDay.Wind;
            todaysDetails[2].textContent = currentDay.Humidity;
        }
    }
};

function LoadSearchHistory(){};