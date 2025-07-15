import React, { useEffect, useState } from "react";
import logo from "./logo.png";
import homeImage from "./home-image.png";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { Universe_backend } from 'declarations/Universe_backend';
import CURRENT_USER_ID from "./main";
function Header() {
  const [userOwnedGalllery,setOwnedGallery]=useState();
  const [listingGallery,setListingGallery]=useState();
  async function getNFTs(){
  const userNFTIds=await Universe_backend.getOwnedNFTs(CURRENT_USER_ID);
  console.log(userNFTIds);
  setOwnedGallery(<Gallery id={userNFTIds} title="MY NFts" role="collection"/>);
  const listedNFTIds=await Universe_backend.getListedNFTs();
  console.log(listedNFTIds);
  setListingGallery(<Gallery id={listedNFTIds} title="Discover" role="discover" />)
  }
  useEffect(()=>{
    getNFTs();
  },[])
  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} alt="Logo" />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>

            <Link to="/discover" className="ButtonBase-root Button-root Button-text header-navButtons-3">
           Discover
            </Link>
            <Link to="/minter" className="ButtonBase-root Button-root Button-text header-navButtons-3">
              Minter
            </Link>
            <Link to="/collections" className="ButtonBase-root Button-root Button-text header-navButtons-3">
              My NFTs
            </Link>
          </div>
        </header>
      </div>  

      <Routes>
        <Route path="/discover" element={<h1>{listingGallery}</h1>} />
        <Route path="/minter" element={<Minter />} />
        <Route path="/collections" element={userOwnedGalllery} />
        <Route path="/" element={<img className="bottom-space" src={homeImage} alt="Home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Header;
