import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";
import NFTActorClass "../NFT/nft";


actor  OpenD{
  private type Listing={
    itemOwner:Principal;
    itemPrice:Nat;
  };
  var mapOfNFTs=HashMap.HashMap<Principal,NFTActorClass.NFT>(1,Principal.equal,Principal.hash);
  var mapOfOwners=HashMap.HashMap<Principal,List.List<Principal>>(1,Principal.equal,Principal.hash);
  var mapOfListings=HashMap.HashMap<Principal,Listing>(1,Principal.equal,Principal.hash);
  public shared(msg) func mint(imageData:[Nat8],name : Text) : async Principal {
    let owner :Principal=msg.caller;
    Debug.print(debug_show(Cycles.balance()));
      Cycles.add(100_500_000_000);
     Debug.print(debug_show(Cycles.balance()));

    let newNFT=await NFTActorClass.NFT(name,owner,imageData);
    Debug.print(debug_show(Cycles.balance()));
    let newNFTPrincipal=await newNFT.getCanisterId();
    mapOfNFTs.put(newNFTPrincipal,newNFT);
    addToOwnershipMap(owner,newNFTPrincipal);
      // Debug.print("Canister Id:") ;
      // Debug.print(debug_show( newCFTPrincipal));
    return newNFTPrincipal;
  };
 public func getCyclesBalance() : async Nat {
 
        return Cycles.balance();
    };

    private func addToOwnershipMap(owner:Principal,nftId:Principal){
     var ownedNFTs:List.List<Principal> = switch (mapOfOwners.get(owner)){
      case null List.nil<Principal>();
      case (?result) result;
     };
     ownedNFTs := List.push(nftId, ownedNFTs);
     mapOfOwners.put(owner,ownedNFTs);
    };
 public query func getOwnedNFTs(user:Principal): async [Principal]{

  var userNFTs:List.List<Principal> = switch (mapOfOwners.get(user)){
      case null List.nil<Principal>();
      case (?result) result;
     };
  return List.toArray(userNFTs);
 };
 public query func getListedNFTs():async [Principal]{
  let ids=Iter.toArray(mapOfListings.keys());
  return ids;
 };
 public shared(msg) func listItem(id:Principal,price:Nat):async Text{
  var item : NFTActorClass.NFT=switch(mapOfNFTs.get(id)){
    case null return "NFT does not exist";
    case (?result) result;
  };
  let owner=await item.getOwner();
  if(Principal.equal(owner,msg.caller)){
    let newListing:Listing = {
     itemOwner=owner;
     itemPrice=price;
    };
    mapOfListings.put(id,newListing);
    return "Success";
  }else{
    return "You don't own this NFT";
  }
 };
public query  func getOpenDCanisterId():async Principal{
return Principal.fromActor(OpenD);
};
public query func isListed(id:Principal):async Bool{
  if(mapOfListings.get(id)==null){
    return false;
  }else{
    return true;
  }
};
public query func getOriginalOwner(id:Principal):async Principal{
  var listing:Listing=switch (mapOfListings.get(id)){
    case null return Principal.fromText("");
    case (?result) result;
  };
  return listing.itemOwner; 
};

public query func getListedNFTsPrice(id:Principal):async Nat{
  var listing:Listing=switch (mapOfListings.get(id)){
    case null return 0 ;
    case (?result) result;
  };
  return listing.itemPrice; 
};
public shared(msg) func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal): async Text {
    var purchasedNFT: NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
        case null return "NFT does not exist";
        case (?result) result;
    };
    let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
    Debug.print(debug_show(transferResult));  // Add more debugging here
    if (transferResult == "Success") {
      mapOfListings.delete(id);
        var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(ownerId)) {
            case null List.nil<Principal>();
            case (?result) result;
        };
        ownedNFTs := List.filter(ownedNFTs, func(listItemId: Principal): Bool {
            return listItemId != id;
        });
        addToOwnershipMap(newOwnerId, id);
        return "Success";
    } else {
        return "Error";
    }
}

};
