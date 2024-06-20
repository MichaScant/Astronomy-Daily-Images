import React, {useState, useEffect} from "react";

import {Layout, MediaCard} from '@shopify/polaris'

import './_displayImages.scss';
import {
    CircleUpIcon,
    CircleDownIcon
  } from '@shopify/polaris-icons';


import {
    Favorite,
    FavoriteFilled,
} from '@carbon/icons-react'

import {
    Search,
    DatePicker,
    DatePickerInput,
} from '@carbon/react'

import { date, imageData, editLikes } from "./displayImages";

export interface railsDataFormat {
    id : number,
    copyright:  String
    date: String
    explanation: String
    hdurl: String
    media_type: String
    service_version: String
    title: String
    url: String
  }


const Favorites = ({favouritesSelected} : {favouritesSelected : boolean}) : JSX.Element => {
    var _ = require('lodash');
    
    const [searchValue, setSearchValue] = useState<String>("");

    const [dataDisplayed, setDataDisplayed] = useState<imageData[]>([]);

    const [displayFavourites, setDisplayFavourites] = useState<imageData[]>([]);

    const [startDate, setStartDate] = useState<date | undefined>(undefined);
    
    const [endDate, setEndDate] = useState<date | undefined>(undefined);

    const [overflowHandler, setOverflowHandler] = useState("hidden")

    useEffect(() => {
        if (favouritesSelected === true) {
            getFavourites();
        }
    }, [favouritesSelected])

    useEffect(() => {
        if (searchValue !== "" && displayFavourites.length > 0) {

            const delaySearch = setTimeout(() => {
                console.log("Searching for " + searchValue)
                setDataDisplayed(displayFavourites.filter((x: imageData) => x.nasaData.title.toLowerCase().includes(String(searchValue).toLowerCase())))
            }, 1000)
            
            return () => clearTimeout(delaySearch)
        } else {
            setDataDisplayed(displayFavourites);
        }
    }, [displayFavourites, searchValue])

    useEffect(() => {     
        if (startDate !== undefined && endDate !== undefined) {
            //filters out nasa images between specified dates
            const newFavourites = displayFavourites.filter((
                data => (
                    new Date(String(data.nasaData.date)) >= new Date(startDate.year, startDate.month,startDate.day) &&
                    new Date(String(data.nasaData.date)) <= new Date(endDate.year, endDate.month, endDate.day)
                )
            ));

            setDataDisplayed(newFavourites);
        }

    }, [startDate, endDate])

    const getFavourites = async() => {
        const newFavouritesDisplay : imageData[] = [];

        try {
            const response = await fetch("http://rails-backend-env.eba-wnt3ydia.ca-central-1.elasticbeanstalk.com/api/v1/nasa_data", 
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept' : 'application/json'
                    },
                }
            );
            const test = await response.json();
            
            test.forEach((image : railsDataFormat) => {
                
                const newCardInfo = {
                    id : image.id,
                    showDescription: false,
                    nasaData : image,
                    liked : true,
                    likes : 1
                }

                newFavouritesDisplay.push(newCardInfo)

            })

            setDisplayFavourites(newFavouritesDisplay);
        } catch (error) {
            console.log(error);
        }
    }

   const updateLikes = (props : imageData) => {
    
        const datasetDisplayed = dataDisplayed;
        const dataset = displayFavourites;

        const indexDataDisplayed = datasetDisplayed.findIndex(x => x.id == props.id)
        const indexData = dataset.findIndex(x => x.id == props.id)

        datasetDisplayed[indexDataDisplayed].likes = props.likes;
        dataset[indexData].likes = props.likes;
        
        datasetDisplayed[indexDataDisplayed].liked = props.liked;
        dataset[indexData].liked = props.liked;

        setDataDisplayed([...datasetDisplayed]);
        setDisplayFavourites([...dataset]);
        
        const newFavourite = dataset[indexData]
        editLikes(newFavourite);
        
    }

    const updateMaxStartDate = (event : Date[]) => {
        if (event.length == 2) {
            setEndDate({
                year : event[1].getFullYear(),
                month: event[1].getMonth(),
                day : event[1].getDate()
            })
            setStartDate({
                year : event[0].getFullYear(),
                month: event[0].getMonth(),
                day : event[0].getDate()
            })
        }
    }

    return (
        <div className="background">
            <Layout sectioned = {true}>
                <div className='searchConstraints'>
                    <Search
                        size='md'
                        placeholder="Search by Title"
                        defaultValue = ""
                        labelText = "Title"
                        onChange={(event) => {
                            setSearchValue(event.target.value);
                        }}
                    />
                </div>
                <div className="filterByDates">
                <DatePicker
                    datePickerType="range"
                    onChange={(event) => {
                        updateMaxStartDate(event);
                    }}
                >
                        <DatePickerInput
                            id="date-picker-start"
                            labelText="Start Date"
                            placeholder="mm/dd/yyyy"
                        />

                        <DatePickerInput
                            id="date-picker-end"
                            labelText="End Date"
                            onChange={function noRefCheck(){}}
                            placeholder="mm/dd/yyyy"
                        />
                </DatePicker>
                </div>
                    {dataDisplayed !== undefined && dataDisplayed.length === 0 ?
                        <div className="noDisplayMsgHolder">
                            No Images Favourited
                        </div>
                        
                        :
                        
                        <div className="cardGroup">
                        {dataDisplayed.map((image : imageData) => (
                        <div className = "card" style={{overflow: overflowHandler}}>
                            <MediaCard
                                title = {image.nasaData.title}
                                primaryAction={{
                                    icon: image.showDescription ? CircleUpIcon : CircleDownIcon,
                                    content: image.showDescription ? "Show less" : "Show more",
                                    onAction: () => {
                                        const dataset = displayFavourites;
    
                                        const index = dataset.findIndex(x => x.id == image.id)
                                
                                        dataset[index].showDescription = !image.showDescription;
                                        
                                        setDisplayFavourites(dataset)

                                        if (overflowHandler === 'scroll') {
                                            setOverflowHandler('hidden')
                                        } else {
                                            setOverflowHandler('scroll')
                                        }
                                    },  
                                }}
                                size="small"
                                portrait={true}
                                description = {image.showDescription ? String(image.nasaData.explanation) : ""} 
                            >
                                <div className="imageGrouping">
                                    {image.nasaData.media_type == 'image' ?
                                        <img className="image"src={String(image.nasaData.hdurl)}/> 
                                        :
                                        <iframe 
                                            className="image" 
                                            src={String(image.nasaData.url)}
                                        /> 
                                    }
                                </div>
                                <div className="date">{image.nasaData.date}</div>
                            </MediaCard>
                            
                            <div className="likesComponent" onClick={() => {
                                const index = displayFavourites.indexOf(image);
                                if (image.liked) {

                                    const liked = false;
                                    const likes = image.likes - 1;
                                    
                                    updateLikes(
                                        {
                                            id : image.id,
                                            nasaData: image.nasaData,
                                            showDescription : image.showDescription,
                                            likes : likes,
                                            liked : liked
                                        }
                                    )

                                } else {
                                    
                                    const l1 = true;
                                    const l2 = image.likes + 1;

                                    
                                    updateLikes(
                                        {
                                            id : image.id,
                                            nasaData: image.nasaData,
                                            showDescription : image.showDescription,
                                            likes : l2,
                                            liked : l1
                                        }
                                    )
                                }
                            }}>
                                <div className="likedIcon">
                                {image.liked ? 
                                    <FavoriteFilled fill="white" size="48"/>
                                    :
                                    <Favorite fill="white" size="48"/>
                                }
                                </div>
                                Likes: {image.likes}
                            </div>
                        </div>
                    ))}
                </div>
                    }
            </Layout>
            <br/>
        </div>
    );
}


export default Favorites;