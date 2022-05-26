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
            setData(json);
        }catch(e) {
            console.log(e)
        }
    };
    
    
    useEffect(()=> {
        console.log(weatherData());
    }, [])

    
	return (
        <div> 
        {/* {data.map((props)=>{ 
            const iconURL = `http://openweathermap.org/img/wn/ + ${props.list.weather.icon} + .png/`
            return (
                    <div className="card-container">
                        <div className="day-of-the-week">
                            <h4>Monday</h4>
                        </div>
                        <div className="date">
                            <h5>March 1st, 1:00pm</h5>
                        </div>
                        <div className="temp-img-container">
                            <div className="img-container">
                                <img  className="img" alt= 'sunny day' src={iconURL}></img> 
                            </div>
                        
                            <div className="temp">
                                <h3>{Math.floor((props.list.main.temp - 273.15)*1.8000 +32.00)}</h3>
                            </div>
                        </div>
                        <div>
                            <h6>{props.list.weather.description}</h6>
                        </div>
                    </div>
                    )})}  */}
        </div>

	);
}
