import React, {useState, useEffect} from 'react';
import './App.css';
import DisplayImages from './images/displayImages';
import { imageData } from './images/displayImages';
import Favorites from './images/Favourites';

import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@carbon/react'

const App = () => {
  
  const [favouriteArray, setFavourites] = useState<imageData[]>([])

  useEffect(() => {
    console.log("Saved: " +  favouriteArray);
}, [favouriteArray]);

  return (
    <div className="App">
      <header className="App-header">
        <Tabs>
          <TabList aria-label='list of tabs'>
              <Tab> Browsing Page </Tab>
              <Tab> Favourites </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h1>Welcome to Nasa's Astronomy showcase Version 2.0</h1>
              <h3 className='subTitle'>Presenting Nasa's Pictures of the day</h3>

              <DisplayImages 
                favourites = {favouriteArray}
                setFavourites = {setFavourites}
              />
              
            </TabPanel>
            <TabPanel>
              <h1>Favourites</h1>
              <Favorites 
                favourites = {favouriteArray}
                setFavourites = {setFavourites}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </header>
    </div>
  );
}

export default App;
