import React, {useState} from "react";
//import Card from '@mui/material/Card';
import { endianness } from "os";
import {Layout, MediaCard} from '@shopify/polaris'
import './displayImages.css';
import {
    ThumbsUpMinor,
    HeartMajor,
    ThumbsDownMinor
  } from '@shopify/polaris-icons';

export default class Display extends React.Component<any,any> {
    constructor(props: any) {
        super(props);
        
        this.state = {
            imgData : [],
            hasData: false,
            likes: [],
            liked: [],
        };
        
    }

    componentDidMount() {
        var date = new Date();
        var day = String(date.getDate()).padStart(3,'-0');
        var endMonth = String(date.getMonth() + 1).padStart(3,'-0');
        var endYear = String(date.getFullYear())
        var startYear = endYear;
        var startMonth = endMonth;

        if (date.getMonth() + 1 === 1 ) {
            startMonth = String(12);
            startYear = String(date.getFullYear() - 1);
        } else {
            startMonth = String(date.getMonth()).padStart(3,'-0')
        }


        fetch("https://api.nasa.gov/planetary/apod?start_date=" + startYear + startMonth + day + "&end_date=" + endYear + endMonth + day+ "&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez")
            .then(reply => {
                return reply.json();
            })
            .then(data => {
                this.setState({
                    imgData: data.reverse(),
                    hasData: true,
                });

                console.log("img data: ", this.state.imgData);
            })
    }


    render() {
        const {imgData, hasData, likes, liked} = this.state;
        
        for (var i = imgData.length-1; i >= 0; i--) {
            likes.push(0);
            liked.push(false);
        }

        if (!hasData) {
            return "";
        } else {
            return (
                <Layout sectioned = {true}>
                    {imgData.map((image : any) => (
                        <div>
                        <div className = "card">
                        <Layout.Section>
                        <MediaCard
                            title = {"Picture of the day on " + image.date}
                            primaryAction={{
                                icon: (!likes[imgData.indexOf(image)]) ? ThumbsUpMinor : ThumbsDownMinor,
                                content: "Likes: " + likes[imgData.indexOf(image)],
                                onAction: () => {
                                    const index = imgData.indexOf(image);
                                    if (liked[index]) {
                                        const l1 = liked;
                                        const l2 = likes;

                                        l1[index] = false;
                                        l2[index] -= 1;

                                        this.setState({
                                            likes : l2,
                                            liked : l1,
                                        });

                                    } else {
                                        const l1 = liked;
                                        const l2 = likes;

                                        l1[index] = true;
                                        l2[index] += 1;

                                        this.setState({
                                            likes : l2,
                                            liked : l1,
                                        });
                                    }
                                },  
                            }}
                            size="small"
                            portrait={true}
                            description = {image.explanation} 
                        >
                            <img className="image"src={image.hdurl}/> 
                        </MediaCard>
                        </Layout.Section>
                        <br/>
                        </div>
                        <br/>
                        <br/>
                        </div>
                    ))}
                </Layout>
            );
        }
    }
}
//export default getApiInfo;