import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import {
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';

import { db } from '@/firebase';



interface Profile {

  id:string;

  user_id:string;

  minecraft_username:string | null;

  display_name:string | null;

  avatar_url:string | null;

  coins:number;

  rank:string;

  playtime_hours:number;

  achievements:number;

  created_at:any;

  updated_at:any;

}



export const useProfile =()=>{


const {user}=useAuth();

const {toast}=useToast();


const [profile,setProfile]=useState<Profile|null>(null);

const [loading,setLoading]=useState(true);





const fetchProfile = async()=>{


if(!user){

 setProfile(null);

 setLoading(false);

 return;

}



try{


const profileRef = doc(

 db,

 "profiles",

 user.uid

);



const snapshot = await getDoc(profileRef);



if(snapshot.exists()){


setProfile({

 id:snapshot.id,

 ...snapshot.data()

} as Profile);



}else{


// gumawa ng default profile


const newProfile={


user_id:user.uid,


minecraft_username:null,


display_name:user.email?.split("@")[0] || "Player",


avatar_url:null,


coins:0,


rank:"Default",


playtime_hours:0,


achievements:0,


created_at:new Date(),


updated_at:new Date()


};



await setDoc(

profileRef,

newProfile

);



setProfile({

id:user.uid,

...newProfile

} as Profile);



}



}catch(error){


console.error(
"Error fetching profile:",
error
);


toast({

title:"Error",

description:"Failed to load profile data",

variant:"destructive"

});



}finally{


setLoading(false);


}


};







const updateProfile = async(

updates:Partial<Profile>

)=>{


if(!user || !profile){

return {

error:"No user or profile found"

};

}



try{


const profileRef = doc(

db,

"profiles",

user.uid

);



const updateData={


...updates,

updated_at:new Date()

};



await updateDoc(

profileRef,

updateData

);



const newProfile={

...profile,

...updateData

};



setProfile(newProfile);



toast({

title:"Success",

description:"Profile updated successfully"

});



return {

data:newProfile

};



}catch(error){


console.error(
"Error updating profile:",
error
);


toast({

title:"Error",

description:"Failed to update profile",

variant:"destructive"

});



return {

error

};


}



};







useEffect(()=>{

fetchProfile();

},[user]);





return {

profile,

loading,

updateProfile,

refetch:fetchProfile

};


};
