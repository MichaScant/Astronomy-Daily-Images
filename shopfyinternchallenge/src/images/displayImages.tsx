import React, {useState, useEffect, useRef} from "react";

import { endianness } from "os";
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
    Search
} from '@carbon/react'

import { RotatingLines } from "react-loader-spinner";


interface nasaJsonData {
  copyright:  String
  date: String
  explanation: String
  hdurl: String
  media_type: String
  service_version: String
  title: String
  url: String
}

interface imageData {
    id : number
    nasaData : nasaJsonData
    showDescription : boolean
    likes : number
    liked : boolean
}
interface nasaDataSet {
    imgData : imageData[]
    hasData : boolean
}   

interface date {
    year : number,
    month: number,
    day : number
}

const DisplayImages = () : JSX.Element => {

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

    const [startDate, setStartDate] = useState<date>({
        day : endDate.day,
        month: endDate.month,
        year: endDate.year
    })

    const fetchMoreData = async() => {
        setLoading(true);

        const deductor = 4;

        var currentStartDate : date = {
            ...startDate
        }

        if (startDate.month === 1 && startDate.day - deductor <= 0) {
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
        } else if (startDate.day - deductor <= 0) {
            updateStartDate({
                ...startDate,
                month : startDate.month - 1,
                day : new Date(startDate.year, startDate.month - 1, 0).getDate() + (startDate.day - deductor)
            })

            currentStartDate = {
                ...startDate,
                month : startDate.month - 1,
                day : new Date(startDate.year, startDate.month - 1, 0).getDate() + (startDate.day - deductor)
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

        const response = await fetch("https://api.nasa.gov/planetary/apod?start_date=" + String(currentStartDate.year) + String(currentStartDate.month).padStart(3,'-0') + String(currentStartDate.day).padStart(3,'-0') + "&end_date=" + String(endDate.year) + String(endDate.month).padStart(3,'-0') + String(endDate.day).padStart(3,'-0') + "&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez");
        const newData : nasaJsonData[] = await response.json();

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

        setLoading(false);
    }

    useEffect(() => {
        fetchMoreData();
    }, []);

    useEffect(() => {
        if (backgroundRef.current != null) {
            backgroundRef.current.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
      }, [loading]);

    var loadingCurrent = loading

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
        setDataDisplayed([...dataDisplayed, ...props.imgData])
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
    }

    const handleScroll = () => {
        if ((backgroundRef.current != null && !(backgroundRef.current.scrollHeight - backgroundRef.current.clientHeight - backgroundRef.current.scrollTop < 1)) || loading || loadingCurrent) {
            return;
        } else {
            loadingCurrent = true;
        }

        fetchMoreData();
    }

    const filterNasaData = (title : string) => {
        
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
                            placeholder="Search for messages"
                            defaultValue = ""
                            labelText = "Search"
                            onChange={(event) => {
                                setSearchValue(event.target.value);
                            }}
                        />
                        
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