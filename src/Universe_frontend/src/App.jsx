import { useState } from 'react';
import { Universe_backend } from 'declarations/Universe_backend';
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";

import Minter from "./Minter"
import Item from './Item';
function App() {
//const NFTID="ctiya-peaaa-aaaaa-qaaja-cai";
  return (
    <main>
      <div className="App">
      <Header />
      {/*<Minter />*/}
      {/*<Item  id={NFTID}/>*/}
      
      <Footer />
    </div>
    </main>
  );
}

export default App;
