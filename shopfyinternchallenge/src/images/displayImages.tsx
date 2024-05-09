import React, {useState, useEffect, useRef, useCallback, Dispatch, SetStateAction} from "react";

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
    DatePickerInput
} from '@carbon/react'

import { RotatingLines } from "react-loader-spinner";

export interface nasaJsonData {
  copyright:  String
  date: String
  explanation: String
  hdurl: String
  media_type: String
  service_version: String
  title: String
  url: String
}

export interface imageData {
    id : number
    nasaData : nasaJsonData
    showDescription : boolean
    likes : number
    liked : boolean
}

export interface displayImagesProps {
    favourites: imageData[];
    setFavourites: React.Dispatch<React.SetStateAction<imageData[]>>
};

export interface nasaDataSet {
    imgData : imageData[]
    hasData : boolean
}   

export interface date {
    day : number,
    month: number,
    year : number,
}

const DisplayImages = (displayFavourites : displayImagesProps) : JSX.Element => {
    var _ = require('lodash');
    
    const [loading, setLoading] = useState<boolean>(false);
    const backgroundRef = useRef<HTMLDivElement>(null);
    
    const [state, setState] = useState<nasaDataSet>({
        imgData : [],
        hasData : false
    });

    const [searchValue, setSearchValue] = useState<String>("");

    const [dataDisplayed, setDataDisplayed] = useState<imageData[]>([]);

    const [endDate, setEndDate] = useState<date>({
        day : new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    })

    const [maxStartDate, setMaxStartDate] = useState<date | undefined>(undefined)

    const [startDate, setStartDate] = useState<date>({
        day : endDate.day,
        month: endDate.month,
        year: endDate.year
    })

    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchMoreData = async() => {
        const deductor = 4;

        var currentStartDate : date = {
            ...startDate
        }

        //calculates how far back start date should be set to account for the need to load more nasa data
        if (startDate.month === 1 && startDate.day - deductor <= 0) {
            if (maxStartDate != undefined && new Date(startDate.year - 1, 12, 31 + startDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...startDate,
                    month : 12,
                    year : startDate.year - 1,
                    day : new Date(startDate.year - 1, 12, 0).getDate() + (startDate.day - deductor)
                })

                currentStartDate = {
                    ...startDate,
                    month : 12,
                    year : startDate.year - 1,
                    day : new Date(startDate.year, startDate.month - 1, 0).getDate() + (startDate.day - deductor)
                }
            }
        } else if (startDate.day - deductor <= 0) {
            const numOfDaysInMonth = new Date(startDate.year, startDate.month - 1, 0).getDate()

            if (maxStartDate != undefined && new Date(startDate.year, startDate.month - 1, numOfDaysInMonth + startDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...startDate,
                    month : startDate.month - 1,
                    day : numOfDaysInMonth + (startDate.day - deductor)
                })

                currentStartDate = {
                    ...startDate,
                    month : startDate.month - 1,
                    day : new Date(startDate.year, startDate.month - 1, 0).getDate() + (startDate.day - deductor)
                }
            }
        } else {
            if (maxStartDate != undefined && new Date(startDate.year, startDate.month, startDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...startDate,
                    day : startDate.day - deductor
                })

                currentStartDate = {
                    ...startDate,
                    day : startDate.day - deductor         
                }
            }
        }

        try {
            const response = await fetch("https://api.nasa.gov/planetary/apod?start_date=" + String(currentStartDate.year) + String(currentStartDate.month).padStart(3,'-0') + String(currentStartDate.day).padStart(3,'-0') + "&end_date=" + String(endDate.year) + String(endDate.month).padStart(3,'-0') + String(endDate.day).padStart(3,'-0') + "&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez");
            const newData : nasaJsonData[] = await response.json();

            //creates general stucture for each nasa data to help track the amount of likes per picture and provide unique identifiers
            const dataCardInfo : imageData[] = [];
            var counterId = state.imgData.length;
            newData.forEach((image : nasaJsonData) => {
                dataCardInfo.push({
                    id : counterId,
                    showDescription: false,
                    nasaData : image,
                    liked : false,
                    likes : 0
                })
                counterId += 1;
            })

            setEndDate({year : currentStartDate.year, month : currentStartDate.month, day : currentStartDate.day - 1});

            updateData({imgData : dataCardInfo.reverse(), hasData: true});
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    //initializes the first data retrevial
    useEffect(() => {
        fetchMoreData();
    }, []);

    //Infinite loading: monitores when the user scrolls down all the way and loads more data if available
    //Availability is based on filters
    useEffect(() => {
        if (loading) return;

        const observer = new IntersectionObserver(
            entries => {
              if (entries[0].isIntersecting && !(_.isEqual(maxStartDate, startDate))) {
                fetchMoreData();
                setLoading(true);
              }
            },
            { threshold: 1 }
          );

        if (observerTarget.current !== null) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        }

      }, [observerTarget.current, loading, maxStartDate]);
      

    useEffect(() => {
        if (!loading) {
            setDataDisplayed([...dataDisplayed, ...state.imgData]);
        }
    }, [loading, state])

    const updateStartDate = (props : date) => {
        setStartDate({
            ...startDate,
            day : props.day,
            month : props.month,
            year : props.year
        })
    }

    const updateData = (props : nasaDataSet) => {
        setState({
            imgData : [...state.imgData, ...props.imgData],
            hasData : props.hasData
        })
    }

    const updateLikes = (props : imageData) => {
        const dataset = state.imgData;
        
        const index = dataset.findIndex(x => x.id == props.id)

        dataset[index].likes = props.likes;
        dataset[index].liked = props.liked;
        
        setState({
            ...state,
            imgData: dataset
        })
        
        //removes from favoruites if image is unliked
        const newFavourite = dataset[index]
        const favouriteIndex = displayFavourites.favourites.findIndex(x => x.id == props.id);
        if (newFavourite != undefined && props.liked === true) {
            displayFavourites.setFavourites([...displayFavourites.favourites, newFavourite]);
        } else if ((newFavourite != undefined && favouriteIndex !== -1)) {
            const favouriteArray = displayFavourites.favourites;
            favouriteArray.splice(favouriteIndex, 1);
            displayFavourites.setFavourites([...favouriteArray]);
        }
    }

    const updateDates = (event : Date[]) => {
        if (event.length == 2) {
            setDataDisplayed([])
            setState({
                ...state,
                imgData : []
            })
            setEndDate({
                year : event[1].getFullYear(),
                month: event[1].getMonth() + 1,
                day : event[1].getDate()
            })
            setStartDate({
                year : event[1].getFullYear(),
                month: event[1].getMonth() + 1,
                day : event[1].getDate()
            })

            setMaxStartDate({
                year : event[0].getFullYear(),
                month: event[0].getMonth() + 1,
                day : event[0].getDate()
            })
        }
    }

    if (!state.hasData) {
        return <></>;
    } else {
        return (
            <div className="background" ref = {backgroundRef}>
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
                            updateDates(event);
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
                    <div className="cardGroup">
                        {state.imgData.filter(x => x.nasaData.title.includes(String(searchValue))).map((image : imageData) => (
                            <div className = "card">
                                <MediaCard
                                    title = {image.nasaData.title}
                                    primaryAction={{
                                        icon: image.showDescription ? CircleUpIcon : CircleDownIcon,
                                        content: image.showDescription ? "Show less" : "Show more",
                                        onAction: () => {
                                            const dataset = state.imgData;
        
                                            const index = dataset.findIndex(x => x.id == image.id)
                                    
                                            dataset[index].showDescription = !image.showDescription;
                                            
                                            setState({
                                                ...state,
                                                imgData: dataset
                                            })
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
                                    const index = state.imgData.indexOf(image);
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
                </Layout>
                <div className = "observer" ref={observerTarget}><br/></div>
                <br/>

                {loading && 
                    <RotatingLines
                        strokeColor="black"
                        visible={true}
                    />
                }
            </div>
        );
    }
}

export default DisplayImages;