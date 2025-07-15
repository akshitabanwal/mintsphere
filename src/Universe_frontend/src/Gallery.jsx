import React, { useEffect, useState } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  const [items, setItems] = useState([]); // Initialize with an empty array

  async function fetchItems() {
    if (props.id && props.id.length > 0) { // Ensure props.id is valid and non-empty
      setItems(
        props.id.map((NFTId) => {
          // Ensure that NFTId is valid before accessing toText()
          return (
            <Item id={Principal.fromText(NFTId.toText())} key={NFTId.toText()} role={props.role} />
          );
        })
      );
    } else {
      setItems([]); // Clear items if id is undefined or empty
    }
  }

  useEffect(() => {
    fetchItems(); // Fetch items when props.id changes
  }, [props.id]);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items.length > 0 ? items : <p>No items available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
