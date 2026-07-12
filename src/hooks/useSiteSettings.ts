import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';

import { db } from '@/firebase';

import { useToast } from '@/hooks/use-toast';



export interface SiteSetting {

  id:string;

  setting_key:string;

  setting_value:{
    value:string;
  };

  updated_by?:string;

  created_at:any;

  updated_at:any;

}




export const useSiteSettings =()=>{


const {toast}=useToast();

const queryClient=useQueryClient();




const {
 data:settings,
 isLoading

}=useQuery({


queryKey:[
 'site-settings'
],



queryFn:async()=>{


const q = query(

collection(
 db,
 "site_settings"
),

orderBy(
 "setting_key"
)

);



const snapshot = await getDocs(q);



return snapshot.docs.map(doc=>({

id:doc.id,

...doc.data()

})) as SiteSetting[];



}



});







const updateSetting = useMutation({



mutationFn:async({

key,

value

}:{

key:string;

value:string;

})=>{



// hanapin ang document gamit ang setting_key

const snapshot = await getDocs(

query(

collection(
 db,
 "site_settings"
)

)

);



const settingDoc = snapshot.docs.find(

doc => 

doc.data().setting_key === key

);





if(!settingDoc){

throw new Error(
"Setting not found"
);

}





const ref = doc(

db,

"site_settings",

settingDoc.id

);





await updateDoc(

ref,

{

setting_value:{
 value
},

updated_at:
new Date()

}

);





return {

id:settingDoc.id,

value

};



},






onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
'site-settings'
]

});



toast({

title:"Settings updated",

description:
"Website settings have been updated successfully."

});


},





onError:(error:any)=>{


toast({

title:"Error",

description:error.message,

variant:"destructive"

});


}



});








const getSetting=(key:string):string=>{


const setting = settings?.find(

s=>

s.setting_key === key

);



return setting?.setting_value?.value || "";

};





return {


settings:settings || [],

isLoading,

updateSetting:updateSetting.mutate,

getSetting


};



};
