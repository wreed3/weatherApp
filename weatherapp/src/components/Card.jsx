import React from "react";

export default function Card() {



    
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
                    <img  className="img" alt= 'sunny day' src="https://th.bing.com/th/id/R.448c55dd52f4513f2ec723edbaefa363?rik=8BApBF1d6lsXag
                    &riu=http%3a%2f%2fgetdrawings.com%2fcliparts%2fsunny-weather-clipart-39.jpg&
                    ehk=SMvlsJ4vnasKmp2CiBE5PuRGKUO%2fxRUAo4sy9w06pCU%3d&risl=&pid=ImgRaw&r=0"></img>  
                </div>
            
                <div className="temp">
                    <h3>67F</h3>
                </div>
            </div>
            <div>
                <h6>Clear Sky</h6>
            </div>
		</div>
	);
}
