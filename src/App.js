import React, { Component } from 'react';
import './App.css';
import Cube from "./components/Cube";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretUp, faCaretDown, faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'

library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight);

class App extends Component {
  render() {
    return (
      <div className="App">
          <Cube />
      </div>
    );
  }
}

export default App;
