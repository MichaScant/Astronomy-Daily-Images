import React, {useState, useRef} from 'react';
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
  
  const [favoruitesSelected, setFavouritesSelected] = useState<boolean>(false);

  const homeClick = () => {
    setFavouritesSelected(false);
  }

  const favoritesClicked = () => {
    setFavouritesSelected(true);
  }

  return (
    <div className="App">
      <header className="App-header">
        <Tabs>
          <TabList aria-label='list of tabs'>
              <Tab onClick={homeClick}> Browsing Page </Tab>
              <Tab onClick={favoritesClicked}> Favourites </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h1>Welcome to Nasa's Astronomy showcase Version 2.0</h1>
              <h3 className='subTitle'>Presenting Nasa's Pictures of the day</h3>

              <DisplayImages/>
              
            </TabPanel>
            <TabPanel>
              <h1>Favourites</h1>
              <Favorites 
                favouritesSelected = {favoruitesSelected}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </header>
    </div>
  );
}

export default App;
