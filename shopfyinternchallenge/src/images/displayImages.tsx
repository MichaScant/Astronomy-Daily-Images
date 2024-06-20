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

export const checkExistingFavourites = async(id : string) => {
    try {
        console.log("Checking ID: " + id);
        const response = await fetch("http://rails-backend-env.eba-wnt3ydia.ca-central-1.elasticbeanstalk.com/api/v1/nasa_data/" + id, 
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json'
                },
            }
        );
        const test = await response.json();

        return test
    } catch (error) {
        console.log(error);
        return undefined
    }
}

export const editLikes = async(image : imageData ) => {
    try {
        const response = await checkExistingFavourites(String(image.id));
        
        if (image != undefined && image.liked === true && response[0].data.id === undefined) {
            storeData(image);
        } else {
            deleteData(image);
        }

    } catch (error) {
        console.log(error);
    }
}

export const storeData = async(image : imageData) => {
    const newJson = {
        id: image.id,
        ...image.nasaData
    }
    try {
        const response = await fetch("http://rails-backend-env.eba-wnt3ydia.ca-central-1.elasticbeanstalk.com/api/v1/nasa_data", 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json'
                },
                body: JSON.stringify(newJson)
            }
        );
        const test = await response.json();
    } catch (error) {
        console.log(error);
    }
}

export const deleteData = async(image : imageData) => {
    try {
        const response = await fetch("http://rails-backend-env.eba-wnt3ydia.ca-central-1.elasticbeanstalk.com/api/v1/nasa_data/" + image.id, 
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json'
                }
            }
        );
        const test = await response.json();
    } catch (error) {
        console.log(error);
    }
}

const DisplayImages = () : JSX.Element => {
    var _ = require('lodash');
    
    const [loading, setLoading] = useState<boolean>(false);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const [overflowHandler, setOverflowHandler] = useState("hidden")
    
    const [state, setState] = useState<nasaDataSet>({
        imgData : [],
        hasData : false
    });

    const [searchValue, setSearchValue] = useState<String>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);

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
    
    const [isError, setIsError] = useState(false);

    const fetchMoreData = async() => {
        const deductor = 5;

        var currentStartDate : date = {
            ...startDate
        }

        //calculates how far back start date should be set to account for the need to load more nasa data
        if (endDate.month === 1 && endDate.day - deductor <= 0) {
            if (maxStartDate != undefined && new Date(endDate.year - 1, 12, 31 + endDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...endDate,
                    month : 12,
                    year : endDate.year - 1,
                    day : new Date(endDate.year - 1, 12, 0).getDate() + (endDate.day - deductor)
                })

                currentStartDate = {
                    ...endDate,
                    month : 12,
                    year : endDate.year - 1,
                    day : new Date(endDate.year, endDate.month - 1, 0).getDate() + (endDate.day - deductor)
                }
            }
        } else if (endDate.day - deductor <= 0) {
            const numOfDaysInMonth = new Date(endDate.year, endDate.month - 1, 0).getDate()

            if (maxStartDate != undefined && new Date(endDate.year, endDate.month - 1, numOfDaysInMonth + endDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...endDate,
                    month : endDate.month - 1,
                    day : numOfDaysInMonth + (endDate.day - deductor)
                })

                currentStartDate = {
                    ...endDate,
                    month : endDate.month - 1,
                    day : new Date(endDate.year, endDate.month - 1, 0).getDate() + (endDate.day - deductor)
                }
            }
        } else {
            if (maxStartDate != undefined && new Date(endDate.year, endDate.month, endDate.day - deductor) < new Date(maxStartDate.year, maxStartDate.month, maxStartDate.day)) {
                updateStartDate({
                    ...maxStartDate,
                })
    
                currentStartDate = {
                    ...maxStartDate,
                }
            } else {
                updateStartDate({
                    ...endDate,
                    day : endDate.day - deductor
                })

                currentStartDate = {
                    ...endDate,
                    day : endDate.day - deductor         
                }
            }
        }

        try {
            const response = await fetch("https://api.nasa.gov/planetary/apod?start_date=" + String(currentStartDate.year) + String(currentStartDate.month).padStart(3,'-0') + String(currentStartDate.day).padStart(3,'-0') + "&end_date=" + String(endDate.year) + String(endDate.month).padStart(3,'-0') + String(endDate.day).padStart(3,'-0') + "&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez");
            const newData : nasaJsonData[] = await response.json();

            //creates general stucture for each nasa data to help track the amount of likes per picture and provide unique identifiers
            var dataCardInfo : imageData[] = [];
            var counterId = state.imgData.length;


            newData.forEach(async (image : nasaJsonData) => {
                var newCardInfo : imageData = {
                    id : counterId,
                    showDescription: false,
                    nasaData : image,
                    liked : false,
                    likes : 0
                }
                dataCardInfo.push(newCardInfo)
                counterId += 1;
            })

            dataCardInfo = await initializeLikes(dataCardInfo)
            if ( currentStartDate.day - 1 != 0) {
                setEndDate({year : currentStartDate.year, month : currentStartDate.month, day : currentStartDate.day - 1});
            } else if (currentStartDate.month == 1) {
                const newDay = new Date(currentStartDate.year - 1, 12, 0).getDate()
                setEndDate({year : currentStartDate.year - 1, month : 12, day : newDay});
            } else {
                const newDay = new Date(currentStartDate.year, currentStartDate.month - 1, 0).getDate()
                setEndDate({year : currentStartDate.year, month : currentStartDate.month - 1, day : newDay});
            }   

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
              if (entries[0].isIntersecting && !(_.isEqual(maxStartDate, startDate)) && !loading && !isSearching) {
                setLoading(true);
                fetchMoreData();
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

            if (isSearching) {
                const delaySearch = setTimeout(() => {
                    console.log("Searching for " + searchValue)
                    
                    if (searchValue === "") {
                      setDataDisplayed(state.imgData);
                    } else {
                      setDataDisplayed(dataDisplayed.filter((x: imageData) => x.nasaData.title.toLowerCase().includes(String(searchValue).toLowerCase())))
                    }
                  }, 1000)
              
                  return () => clearTimeout(delaySearch)
            } else {
                setDataDisplayed(state.imgData);
            }
        }
    }, [loading, state, searchValue])

    
    const initializeLikes = async(dataCardInfo : imageData[]) => {

        var ids = "";
        dataCardInfo.forEach((entry) => {
            if (dataCardInfo.indexOf(entry) !== dataCardInfo.length - 1) {
                ids += String(entry.id) + ",";
            } else {
                ids += String(entry.id);
            }
        })

        const response = await checkExistingFavourites(ids)
                
        response.forEach((entry : any) => {
            if (entry.data.id !== undefined) {
                const index = dataCardInfo.findIndex(i => i.id == entry.id)
                dataCardInfo[index].liked = true;
                dataCardInfo[index].likes += 1;
            }
        })

        return dataCardInfo;

    }

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
        
        const newFavourite = dataset[index]
        editLikes(newFavourite);

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


    return (
        <div className="background" ref = {backgroundRef}>
            <Layout sectioned = {true}>
                <div className='searchConstraints'>
                    <Search
                        size='md'
                        placeholder="Search by Title"
                        defaultValue = ""
                        labelText = "Search by Title"
                        onSelect={() => {
                            console.log("clicked")
                        }}
                        onChange={(event : any) => {
                            if (event.target.value !== "") {
                                setIsSearching(true);
                                setSearchValue(event.target.value);
                            } else {
                                setIsSearching(false);
                                setSearchValue("");
                            }
                        }}
                    />
                </div>
                <div className="filterByDates">
                <DatePicker
                    datePickerType="range"
                    onChange={(event : any) => {
                        if (event[0] >= new Date() || event[1] > new Date()) {
                            setIsError(true)
                        } else {
                            setIsError(false)
                            updateDates(event);
                        }
                    }}
                    invalid = {isError}
                    invalidText = "Invalid Date Range entered"
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
                    {state.hasData && dataDisplayed.map((image : imageData) => (
                        <div className = "card" style={{overflow: overflowHandler}}>
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

                {loading && 
                    <RotatingLines
                        strokeColor="black"
                        visible={true}
                    />
                }
            </Layout>
            <div className = "observer" ref={observerTarget}><br/></div>
            <br/>
        </div>
    );
    
}

export default DisplayImages;