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
        fetch("https://api.nasa.gov/planetary/apod?start_date=2022-01-15&end_date=2022-01-19&api_key=5PKABlsVOYRzfFMBH7L8U9YeI9TabH2b4KD3rFez")
            .then(reply => {
                return reply.json();
            })
            .then(data => {
                this.setState({
                    imgData: data,
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
                    {imgData.reverse().map((image : any) => (
                        <div>
                        <div className = "card">
                        <Layout.Section>
                        <MediaCard
                            title = {"Picture of the day of " + image.date}
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