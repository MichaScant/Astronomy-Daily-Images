import React, {useState, useEffect, useRef, Dispatch, SetStateAction} from "react";

import { endianness } from "os";
import {Layout, MediaCard} from '@shopify/polaris'

import './_displayImages.scss';
import {
    CircleUpIcon,
    CircleDownIcon
  } from '@shopify/polaris-icons';

import fs from 'fs'

import {
    Favorite,
    FavoriteFilled,
} from '@carbon/icons-react'

import {
    Search,
    DatePicker,
    DatePickerInput,
} from '@carbon/react'

import { date, nasaDataSet, displayImagesProps, imageData, nasaJsonData } from "./displayImages";
import { RotatingLines } from "react-loader-spinner";


const Favorites = (displayFavourites : displayImagesProps) : JSX.Element => {

    /*const [loading, setLoading] = useState<boolean>(false);
    const backgroundRef = useRef<HTMLDivElement>(null);*/
    const [searchValue, setSearchValue] = useState<String>("");

    const [dataDisplayed, setDataDisplayed] = useState<imageData[]>(displayFavourites.favourites);

    const [endDate, setEndDate] = useState<date | undefined>(undefined);
    //const endDateRef = useRef(endDate);

    const [startDate, setStartDate] = useState<date | undefined>(undefined);
    //const startDateRef = useRef(startDate);
    
    useEffect(() => {
        setDataDisplayed(displayFavourites.favourites);
    }, [displayFavourites.favourites]);

    useEffect(() => {     
        if (startDate !== undefined && endDate !== undefined) {
            const newFavourites = displayFavourites.favourites.filter((
                data => (
                    new Date(String(data.nasaData.date)) >= new Date(startDate.year, startDate.month,startDate.day) &&
                    new Date(String(data.nasaData.date)) <= new Date(endDate.year, endDate.month, endDate.day)
                )
            ));

            setDataDisplayed(newFavourites);
        }

    }, [startDate, endDate])


   const updateLikes = (props : imageData) => {
        const datasetDisplayed = dataDisplayed;
        const dataset = displayFavourites.favourites;

        const indexDataDisplayed = datasetDisplayed.findIndex(x => x.id == props.id)
        const indexData = dataset.findIndex(x => x.id == props.id)

        datasetDisplayed[indexDataDisplayed].likes = props.likes;
        datasetDisplayed[indexDataDisplayed].liked = props.liked;

        dataset[indexData].likes = props.likes;
        dataset[indexData].liked = props.liked;

        setDataDisplayed(datasetDisplayed);
        displayFavourites.setFavourites(dataset);
        
        const newFavourite = dataset[indexData];
        const favouriteIndex = displayFavourites.favourites.findIndex(x => x.id == props.id);
        
        if ((newFavourite != undefined && favouriteIndex !== -1)) {
            const favouriteArray = displayFavourites.favourites;
            favouriteArray.splice(favouriteIndex, 1);
            displayFavourites.setFavourites([...favouriteArray]);
        }
    }

    const updateMaxStartDate = (event : Date[]) => {
        if (event.length == 2) {
            setEndDate({
                year : event[1].getFullYear(),
                month: event[1].getMonth() + 1,
                day : event[1].getDate()
            })
            setStartDate({
                year : event[0].getFullYear(),
                month: event[0].getMonth() + 1,
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
                    {dataDisplayed.length === 0 ?
                        <div className="noDisplayMsgHolder">
                            No Images Favourited
                        </div>
                        
                        :
                        
                        <div className="cardGroup">
                            {dataDisplayed.filter(x => x.nasaData.title.includes(String(searchValue))).map((image : imageData) => (
                                <div className = "card">
                                    <MediaCard
                                        title = {image.nasaData.title}
                                        primaryAction={{
                                            icon: image.showDescription ? CircleUpIcon : CircleDownIcon,
                                            content: image.showDescription ? "Show less" : "Show more",
                                            onAction: () => {
                                                const dataset = dataDisplayed;
            
                                                const index = dataset.findIndex(x => x.id == image.id)
                                        
                                                dataset[index].showDescription = !image.showDescription;
                                                
                                                setDataDisplayed(dataset)
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
                                        {image.nasaData.date}
                                    </MediaCard>
                                    
                                    <div className="likesComponent" onClick={() => {
                                        const index = dataDisplayed.indexOf(image);
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