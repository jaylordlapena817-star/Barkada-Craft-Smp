import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';

import { 
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';



export interface PaymentGateway {

  id:string;

  name:string;

  provider:string;

  is_active:boolean;

  is_default:boolean;

  config:Record<string,any>;

  created_at:any;

  updated_at:any;

}



export const usePaymentGateways = ()=>{


const {toast}=useToast();

const queryClient=useQueryClient();



const {
 data:gateways,
 isLoading
}=useQuery({


queryKey:[
 'payment-gateways'
],



queryFn:async()=>{


const q = query(
 collection(
  db,
  "payment_gateways"
 ),
 orderBy(
  "name"
 )
);



const snapshot = await getDocs(q);



return snapshot.docs.map(doc=>({

 id:doc.id,

 ...doc.data()

})) as PaymentGateway[];



}



});





const updateGateway = useMutation({


mutationFn:async({

id,

is_active,

is_default,

config


}:{

id:string;

is_active?:boolean;

is_default?:boolean;

config?:Record<string,any>;

})=>{


const updateData:any={};



if(is_active !== undefined)

 updateData.is_active=is_active;



if(is_default !== undefined)

 updateData.is_default=is_default;



if(config !== undefined)

 updateData.config=config;



updateData.updated_at =
serverTimestamp();





const ref = doc(
 db,
 "payment_gateways",
 id
);



await updateDoc(
 ref,
 updateData
);



return {
 id,
 ...updateData
};



},




onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
'payment-gateways'
]

});



toast({

title:"Success",

description:
"Payment gateway updated successfully."

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






const getActiveGateway=()=>{


return gateways?.find(

gateway=>

gateway.is_active &&
gateway.is_default

);


};





return {

gateways:gateways || [],

isLoading,

updateGateway:updateGateway.mutate,

getActiveGateway

};


};
