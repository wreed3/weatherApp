import React, {useState, useEffect} from "react";

export function CardIcon({ icon, description }) {
    return (
        <img  className="img" alt={description} src={`http://openweathermap.org/img/wn/${icon}.png`}></img>
    );
}

export function Card({ dt_txt, weather, main }) {
    return (
        <div className="card-container">
			<div className="day-of-the-week">
				<h4>{dt_txt}</h4>
			</div>
			<div className="date">
                <h5>{dt_txt}</h5>
            </div>
            <div className="temp-img-container">
                <div className="img-container">
                    {weather.map(entry => (
                        <CardIcon {...entry} />
                    ))}
                </div>
                <div className="temp">
                    <h3>{Math.floor((main.temp - 273.15)*1.8000 +32.00)}</h3>
                </div>
            </div>
		</div>
    );
}

export default function Forecast() {
    const [forecast, setForecast] = useState([]);

    useEffect(() => {
        async function getForecast() {
            const baseURL = 'https://api.openweathermap.org/data/2.5/forecast';
            const searchParams = new URLSearchParams({
                lat: 42.331429,
                lon: -83.045753,
                appid: 'be306616b6cad0ecd57ce6ffa4d8844a', 
            });

            const response = await fetch(`${baseURL}?${searchParams}`);
            const json = await response.json();
            return json.list;
        }

        getForecast().then(setForecast);
    }, []);

    return (
        <>
            {forecast.map(entry => (
                <Card {...entry} />
            ))}
        </>
    )
}
