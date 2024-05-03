import React from 'react';
import logo from './logo.svg';
import './App.css';
import DisplayImages from './images/DisplayImages';


const App = () => {
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Nasa's Astronomy showcase Version 2.0</h1>
        <h3 className='subTitle'>Presenting Nasa's Picture of the day</h3>
        <DisplayImages/>
      </header>
    </div>
  );
}

export default App;
