import React from "react";

export const getData = () => {
    fetch("https://api.nasa.gov/planetary/apod?start_date=2022-01-15&end_date=2022-01-17&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez")
        .then(reply => {
            return reply.json();
        })
        .then(data => {
            
            return data;
        })
}