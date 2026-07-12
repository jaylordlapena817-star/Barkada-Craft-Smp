import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';

import {
  doc,
  getDoc
} from 'firebase/firestore';


export type UserRole = 
  | 'admin'
  | 'moderator'
  | 'user';



export const useUserRole = () => {


  const { user } = useAuth();


  const [role,setRole] = useState<UserRole | null>(null);

  const [loading,setLoading] = useState(true);




  useEffect(()=>{


    const fetchUserRole = async()=>{


      if(!user){

        setRole(null);

        setLoading(false);

        return;

      }



      try{


        const roleRef = doc(
          db,
          "user_roles",
          user.uid
        );



        const snapshot = await getDoc(roleRef);



        if(snapshot.exists()){


          const data = snapshot.data();



          if(
            data.role === "admin" ||
            data.role === "moderator" ||
            data.role === "user"
          ){

            setRole(data.role);

          }else{

            setRole("user");

          }


        }else{


          // Default role

          setRole("user");


        }



      }catch(error){


        console.error(
          "Error fetching user role:",
          error
        );


        setRole("user");


      }finally{


        setLoading(false);


      }


    };



    fetchUserRole();



  },[user]);





  const isAdmin = role === "admin";


  const isModerator =
    role === "moderator" ||
    role === "admin";


  const isUser = role === "user";





  return {

    role,

    loading,

    isAdmin,

    isModerator,

    isUser

  };


};
