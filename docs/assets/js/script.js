const weatherAPIKey = "8bddc3309748f00ebd0dade126b57ec6";
const forecastSection = document.querySelector("#Forecasts");
const siteMessageSection = document.querySelector("#Site-Message");

window.addEventListener("load", () => {
    document.querySelector("#City-Search").addEventListener("click", ClickedSearchButton);
    document.querySelector("#History").addEventListener("click", ClickedHistoryButton);
    document.querySelector("input").addEventListener("keydown", (event) => {
        if(event.key === "Enter"){
            ClickedSearchButton(event);
        }
    })

    LoadSearchHistory();
});

function ClickedSearchButton(event){
    const searchTextEL = event.target.parentNode.querySelector("input");
    
    SearchForWeather(searchTextEL.value);

    searchTextEL.value = "";
};

function ClickedHistoryButton(event){
    if(event.target.localName === "button"){
        SearchForWeather(event.target.textContent);
    }
};

async function SearchForWeather(searchText) {
    siteMessageSection.textContent = "";
    siteMessageSection.classList.add("hide");

    if(searchText === "")
    {
        DisplayError("Please Provide Valid Search Request");
        return;
    }

    let results = await GetForecastData(searchText);

    if (results === null)
    {
        DisplayError("Forecast Results Not Found");
        return;
    }

    AddCityToSearchHistory(results.City);

    UpdateForecastInfo(results);
}

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
    let lat, long, cityName, stateName, countryName;
    let results = {
        City: city,
        Forecast: []
    };

    [lat, long, cityName, stateName, countryName] = await GetLatLongFromAPI(city);

    if (lat === null || long === null) {
        return null;
    }

    let params = new URLSearchParams();

    params.append("lat", lat);
    params.append("lon", long);
    params.append("units", "metric");
    params.append("appid", weatherAPIKey);

    const response = await fetch("https://api.openweathermap.org/data/2.5/forecast?" + params.toString());

    if(!response.ok)
    {
        DisplayError("Response Error:" + response.status + "\n" + "Could not get forecast");
        return null;
    }    

    let forecastData = await response.json();

    if(stateName === undefined){
        results.City = cityName + ", " + countryName; 
    } else {
        results.City = cityName + ", " + stateName + ", " + countryName; 
    }

    //Start at the most current available forecast and advance by 24 hours (8 * 3 Hours = 24)
    for (let index = 0; index < forecastData.list.length; index = index + 8) {
        results.Forecast.push({
            Date: new Date((forecastData.list[index].dt + forecastData.city.timezone) * 1000),
            Temp: forecastData.list[index].main.temp,
            Humidity: forecastData.list[index].main.humidity,
            Wind: forecastData.list[index].wind.speed,
            Icon: forecastData.list[index].weather[0].icon,
            Description: forecastData.list[index].weather[0].description
        })
    }

    //Since the last days forecast might not be available at an even 24 hours out, need to grab the last available forecast
    results.Forecast.push({
        Date: new Date((forecastData.list[forecastData.list.length - 1].dt + forecastData.city.timezone) * 1000),
        Temp: forecastData.list[forecastData.list.length - 1].main.temp,
        Humidity: forecastData.list[forecastData.list.length - 1].main.humidity,
        Wind: forecastData.list[forecastData.list.length - 1].wind.speed,
        Icon: forecastData.list[forecastData.list.length - 1].weather[0].icon,
        Description: forecastData.list[forecastData.list.length - 1].weather[0].description
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

    const response = await fetch("https://api.openweathermap.org/geo/1.0/direct?" + params.toString())
        
    if (response.ok){
        results = await response.json();
        if (results.length != 1)
        {
            DisplayError("No Coordinates Returned" + "\n" + "Could not retrieve Location Coordinates");
            return [null, null];
        }
        return [results[0].lat, results[0].lon, results[0].name, results[0].state, results[0].country];
    } else {
        DisplayError("Response Error: " + response.status + "\n" + "Could not retrieve Location Coordinates");
        return [null, null];
    }
};

function DisplayError(errorMessage){
    forecastSection.classList.add("hide");
    siteMessageSection.classList.remove("hide");
    siteMessageSection.textContent += " | "+errorMessage;
}

function AddResultsToSessionStorage(city, results){};

function UpdateForecastInfo(forecastData){
    if(forecastData)
    {
        const today = document.querySelector("#Day-Forecast");
        
        let todaysDetails = today.querySelectorAll("p span");
        let currentDay = forecastData.Forecast[0];

        today.querySelector("h2 span").textContent = forecastData.City + " (" + currentDay.Date.toLocaleDateString() + ")";
        today.querySelector("h2 img").setAttribute("src", "https://openweathermap.org/img/wn/"+currentDay.Icon+".png");
        today.querySelector("h2 img").setAttribute("alt", currentDay.Description);
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
                forecastDays[index].querySelector("img").setAttribute("src", "https://openweathermap.org/img/wn/"+currentDay.Icon+".png");
                forecastDays[index].querySelector("img").setAttribute("alt", currentDay.Description);
                todaysDetails[0].textContent = currentDay.Temp;
                todaysDetails[1].textContent = currentDay.Wind;
                todaysDetails[2].textContent = currentDay.Humidity;
            }
        }

        forecastSection.classList.remove("hide");
        siteMessageSection.classList.add("hide");
        siteMessageSection.textContent = "";
    } else {
        forecastSection.classList.add("hide");
    }
};

const searchHistoryKey = "SearchHistory";

function LoadSearchHistory(){
    let CurrentHistory = JSON.parse(localStorage.getItem(searchHistoryKey));

    if (CurrentHistory === null){
        CurrentHistory = [];
    }

    CurrentHistory.sort((a, b) => {
        return new Date(b.LastSearch).getTime() - new Date(a.LastSearch).getTime();
    });

    const historyButtons = document.querySelector("#History");

    historyButtons.innerHTML = "";

    CurrentHistory.forEach(hist => {
        let newLI = document.createElement("li");
        let newButton = document.createElement("button");

        newButton.textContent = hist.City;

        newLI.appendChild(newButton);

        historyButtons.appendChild(newLI);
    });
    
};

function AddCityToSearchHistory(city){
    let CurrentHistory = JSON.parse(localStorage.getItem(searchHistoryKey));

    if (CurrentHistory === null){
        CurrentHistory = [];
    }

    let indexOfCity = CurrentHistory.findIndex(x => x.City.toLowerCase() === city.toLowerCase());

    if (indexOfCity != -1)
    {
        CurrentHistory.splice(indexOfCity, 1);
    }

    CurrentHistory.push({
        City: city,
        LastSearch: new Date()
    })

    localStorage.setItem(searchHistoryKey, JSON.stringify(CurrentHistory));

    LoadSearchHistory();
};