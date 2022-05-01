import React from 'react';
import logo from './logo.svg';
import './App.css';
import Display from "./images/displayImages";


function App() {
  return (

    <div className="App">
      <header className="App-header">
        <h1>Welcome to Nasa's Astronomy showcase Version 2.0</h1>
        <h3>Presenting Nasa's Picture of the day</h3>
        <Display/>
      </header>
    </div>
  );
}

export default App;
