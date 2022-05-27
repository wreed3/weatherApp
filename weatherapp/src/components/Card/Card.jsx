import React, {useState, useEffect} from "react";

export default function Card() {
    const [data, setData] = useState([]);
    
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'openweather43.p.rapidapi.com',
            'X-RapidAPI-Key': 'e9adca3a6cmsh3c85d74805897ecp1dc463jsnfe84a8f09fbf'
        }
    };
    
   
    const  weatherData = async () => {
        try{
            const res = await fetch('https://openweather43.p.rapidapi.com/forecast?appid=da0f9c8d90bde7e619c3ec47766a42f4&q=Detroit&cnt=5&units=imperial', options);
            const json = await res.json();
            setData(json.list);
            console.log(json.list)
        }catch(e) {
            console.log(e)
        }
    };
    
    // const newData = [...data]
    
    
    useEffect(()=> {
        weatherData(URL);
        //eslint-disable-next-line 
    }, [])
    
    
	return (
        <React.Fragment> 
            

        {data.map((data)=>{ 
            
            const dayOfWeekName = new Date(data.dt_txt).toLocaleString('default', {weekday: 'long'});
            return (
		<div className="card-container">
			<div className="day-of-the-week">
				<h4>{dayOfWeekName}</h4>
			</div>
			<div className="date">
                <h5>{data.dt_txt}</h5>
            </div>
            <div className="temp-img-container">
                <div className="img-container">
                    <img  className="img" alt= '' src={`http://openweathermap.org/img/wn/${data.weather.icon}.png`}></img>
                </div>
            
                <div className="temp">
                    <h3>{Math.floor((data.main.temp - 273.15)*1.8000 + 32.00)}</h3>
                </div>
            </div>
            <div>
                <h6>{data.weather.description}</h6>
            </div>
		</div>
        )})} 
        </React.Fragment>
	);
}
