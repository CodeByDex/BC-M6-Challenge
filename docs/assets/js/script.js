
window.addEventListener("load", () => {
    document.querySelector("#City-Search").addEventListener("click", ClickedSearchButton);

    LoadSearchHistory();
});

function ClickedSearchButton(event){
    const searchTextEL = event.target.parentNode.querySelector("input");
    
    let results = GetForecastData(searchTextEL.value);

    AddCityToSearchHistory(searchTextEL.value);

    UpdateForecastInfo(results);
};

function GetForecastData(searchText){
    let results = null;

    searchText = searchText.toLowerCase();

    results = CheckSessionForResults(searchText);

    if (results === null){
        results = GetForecastFromAPI(searchText);

        if(results != null){
            AddResultsToSessionStorage(searchText, results);
        }
    }

    results = {
        City: searchText,
        Forecast: [
            {
                Date: new Date("2023-03-04"),
                Temp: 80,
                Humidity: 30,
                Wind: 2
            },
            {
                Date: new Date("2023-03-05"),
                Temp: 81,
                Humidity: 30,
                Wind: 2
            },
            {
                Date: new Date("2023-03-06"),
                Temp: 82,
                Humidity: 30,
                Wind: 2
            },
            {
                Date: new Date("2023-03-07"),
                Temp: 83,
                Humidity: 30,
                Wind: 2
            },
            {
                Date: new Date("2023-03-08"),
                Temp: 84,
                Humidity: 30,
                Wind: 2
            },
            {
                Date: new Date("2023-03-09"),
                Temp: 85,
                Humidity: 30,
                Wind: 2
            }
        ]
    }

    return results;    
};

function CheckSessionForResults(city){};

function GetForecastFromAPI(city){};

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