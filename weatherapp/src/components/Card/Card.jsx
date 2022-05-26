import React, {useState, useEffect} from "react";

export default function Card() {

    // const Detroit = {
    //     lati: 42.331429,
    //     longa: -83.045753,
    //     APIKEY: "be306616b6cad0ecd57ce6ffa4d8844a"
    // }

    // const searchParams = new URLSearchParams(Detroit);

    // const subString = searchParams.toString();

    const lati = 42.331429;
    const longa = -83.045753;

    const APIKEY = "be306616b6cad0ecd57ce6ffa4d8844a";
    const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lati}&lon=${longa}&appid=${APIKEY}`;

    const [data, setData] = useState('');
    
    
    
    const  weatherData = async () => {
        try{
            const res = await fetch(URL);
            const json = await res.json();
            setData(json.list);
            console.log(json.list);
        }catch(e) {
            console.log(e)
        }
    };



    
    useEffect(()=> {
        (weatherData(URL));
    }, [])

    
	return (
        <> 
        {data.map((data)=>{ 
        const iconURL = `http://openweathermap.org/img/wn/ + ${data.weather.icon} + .png`
            return (
		<div className="card-container">
			<div className="day-of-the-week">
				<h4>Monday</h4>
			</div>
			<div className="date">
                <h5>{data.dt_txt}</h5>
            </div>
            <div className="temp-img-container">
                <div className="img-container">
                    <img  className="img" alt= 'sunny day' src={iconURL}></img>
                </div>
            
                <div className="temp">
                    <h3>{Math.floor((data.main.temp - 273.15)*1.8000 +32.00)}</h3>
                </div>
            </div>
            <div>
                <h6>{data.weather.description}</h6>
            </div>
		</div>
        )})} 
        </>
	);
}
