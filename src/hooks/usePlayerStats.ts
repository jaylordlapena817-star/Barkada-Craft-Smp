import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import {
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';

import { db } from '@/firebase';



interface PlayerStats {

  id:string;

  user_id:string;

  total_playtime_hours:number;

  total_coins_earned:number;

  total_purchases:number;

  total_spent:number;

  first_join_date:string;

  last_activity:string;

  blocks_placed:number;

  blocks_broken:number;

  distance_traveled:number;

  deaths:number;

  kills:number;

  level_data:any;

}



export const usePlayerStats =()=>{


const {user}=useAuth();

const [stats,setStats]=useState<PlayerStats|null>(null);

const [loading,setLoading]=useState(true);





useEffect(()=>{


const fetchStats = async()=>{


if(!user){

 setStats(null);

 setLoading(false);

 return;

}



try{


const statsRef = doc(

 db,

 "player_statistics",

 user.uid

);



const snapshot = await getDoc(statsRef);



if(snapshot.exists()){


setStats({

 id:snapshot.id,

 ...snapshot.data()

} as PlayerStats);



}else{


// gumawa ng default stats kapag bagong player


const defaultStats={


user_id:user.uid,

total_playtime_hours:0,

total_coins_earned:0,

total_purchases:0,

total_spent:0,

first_join_date:new Date().toISOString(),

last_activity:new Date().toISOString(),

blocks_placed:0,

blocks_broken:0,

distance_traveled:0,

deaths:0,

kills:0,

level_data:{}


};



await setDoc(
 statsRef,
 defaultStats
);



setStats({

id:user.uid,

...defaultStats

} as PlayerStats);



}



}catch(error){


console.error(
"Error fetching player stats:",
error
);


setStats(null);



}finally{


setLoading(false);


}


};



fetchStats();


},[user]);







const updateStats = async(

updates:Partial<PlayerStats>

)=>{


if(!user || !stats)

return;



try{


const statsRef = doc(

db,

"player_statistics",

user.uid

);



const newData={


...updates,

last_activity:
new Date().toISOString()


};



await updateDoc(

statsRef,

newData

);



setStats({

...stats,

...newData

});




}catch(error){


console.error(

"Error updating player stats:",

error

);


}



};





return {

stats,

loading,

updateStats

};


};
