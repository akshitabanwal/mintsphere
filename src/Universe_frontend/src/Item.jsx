import React, { useEffect, useState } from "react";
import logo from "./logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../declarations/nft";
import { idlFactory as tokenIdlfactory } from "../../declarations/Token_backend";
import { Universe_backend } from 'declarations/Universe_backend';
import { Principal } from "@dfinity/principal";
import  Button  from "./Button";
import CURRENT_USER_ID from "./main";
import PriceLabel from "./priceLabel";
function Item(props) {
  const [name, setName] = useState("");
  const [owner,setOwner]=useState();
  const [imageURL,setImage]=useState();
  const [button,setButton]=useState();
  const [PriceInput,setPriceInput]=useState();
  const [loaderHidden,setLoaderHidden]=useState(true);
  const [Blur,setBlur]=useState();
  const [sellStatus,setSellStatus]=useState("");
  const [priceLabel,setPriceLabel]=useState(0);
  const [shouldDisplay,setShouldDisplay]=useState(true);
  const id = props.id;
  
  // Define localHost URL
  const localHost = "http://localhost:3000/"; // Local replica URL
  
  const agent = new HttpAgent({ host: localHost });

  // Only fetch the root key in local environment (development mode)
  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey(); // Disables certificate verification in local dev environment
  }
let NFTActor;
  // Fetch the NFT data
  async function loadNFT() {
   
   
       NFTActor = await Actor.createActor(idlFactory, {
        agent,
        canisterId: id,
      });
      const nftOwner=await NFTActor.getOwner();
      const nftName = await NFTActor.getName();
      const imagedata=await NFTActor.getAsset();
      
      const imageContent =new Uint8Array(imagedata);
     
      const image= URL.createObjectURL(
        new Blob([imageContent.buffer],
          {type:"image/png" }));
          console.log("Image URL:",image);
      
      setName(nftName);
      setOwner(nftOwner.toText());
      setImage(image);
      if(props.role=="collection"){
      const nftListed= await Universe_backend.isListed(props.id);
      if(nftListed==true){
        setOwner("OpenD");
        setBlur({filter:"blur(4px)"});
        setSellStatus("Listed");
        //setButton();
        //setPriceInput();
      }else{
        setButton(<Button handleClick={handleSell} text={"Sell"}/>);
      }
    
      
    } else if(props.role=="discover"){
      const originalOwner=await Universe_backend.getOriginalOwner(props.id);
      if(originalOwner.toText()!=CURRENT_USER_ID.toText()){
      setButton(<Button handleClick={handleBuy} text={"Buy"}/>);
      }

     const price=await Universe_backend.getListedNFTsPrice(props.id);
     setPriceLabel(<PriceLabel sellPrice={price.toString()}/>)

    }
  
  }

  // Run once when the component mounts
  useEffect(() => {
    loadNFT();
  }, []); // Empty dependency array to run once
  let price;
 async function handleSell(){
    
    setPriceInput(<input
      placeholder="Price in DAKSH"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>price=e.target.value}
    />);
    const nftListed= await Universe_backend.isListed(props.id);
    setButton(<Button handleClick={sellItem} text={"Confirm"}/>);
  }
  async function sellItem(){
    setBlur({filter:"blur(4px)"});
    setLoaderHidden(false);
    console.log("Confirm Clicked",price);
   const listingResult=await Universe_backend.listItem(props.id,Number(price));
   console.log("Listing result: ",listingResult);
   if(listingResult=="Success"){
    const openDId=await Universe_backend.getOpenDCanisterId();
    const transferResult=await NFTActor.transferOwnership(openDId);
    console.log("transfer result ",transferResult);
    if(transferResult=="Success"){
      setLoaderHidden(true);
      setButton();
      setPriceInput();
      setOwner("OpenD");
      setSellStatus("Listed");
    }
   }
  }
  async function handleBuy(){
    console.log("Buy was triggered");
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlfactory, {
      agent,
      canisterId: Principal.fromText("ajuq4-ruaaa-aaaaa-qaaga-cai"),
    });
    const sellerId=await Universe_backend.getOriginalOwner(props.id);
    const itemPrice=await Universe_backend.getListedNFTsPrice(props.id);
   const  result= await tokenActor.transfer(sellerId,itemPrice);
    console.log(result);
    if(result=="success"){
      const transferResult=await Universe_backend.completePurchase(props.id,sellerId,CURRENT_USER_ID);
      console.log("Purchase ",transferResult);
      setLoaderHidden(true);
      setShouldDisplay(false);
    }
  }
  return (
    <div style={{display:shouldDisplay?"inline" :"none"}}className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={imageURL}
          alt="NFT Logo"
          style={Blur}
        />
      <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

        <div className="disCardContent-root">
       {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            
            {name ? name : "Loading..."} <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner} {/* Use dynamic owner data from props */}
          </p>
          {PriceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
