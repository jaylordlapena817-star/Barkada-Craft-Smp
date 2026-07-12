import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/firebase';
import { ref, onValue, set, remove } from 'firebase/database';


interface ServerEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  rewards: string[];
  requirements: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_registered?: boolean;
}


export const useEvents = () => {

  const { user } = useAuth();

  const [events,setEvents] = useState<ServerEvent[]>([]);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    const eventsRef = ref(database,'server_events');


    const unsubscribe = onValue(eventsRef,(snapshot)=>{

      const data = snapshot.val();


      if(!data){
        setEvents([]);
        setLoading(false);
        return;
      }


      let list:ServerEvent[] = Object.entries(data)
        .map(([id,value]:any)=>({

          id,

          ...value,

          user_registered:false

        }))
        .filter(event=>event.is_active);



      // Check registration
      if(user){

        const userRef = ref(
          database,
          `event_participants/${user.uid}`
        );


        onValue(userRef,(snap)=>{

          const registrations = snap.val() || {};


          list = list.map(event=>({

            ...event,

            user_registered:
              registrations[event.id] === true

          }));


          setEvents(list);

        },{onlyOnce:true});


      }else{

        setEvents(list);

      }


      setLoading(false);


    });


    return ()=>unsubscribe();


  },[user]);





  const registerForEvent = async(eventId:string)=>{


    if(!user){

      return {
        error:'Must be logged in to register'
      };

    }


    try{


      await set(

        ref(
          database,
          `event_participants/${user.uid}/${eventId}`
        ),

        true

      );



      setEvents(prev=>

        prev.map(event=>

          event.id===eventId

          ?

          {
            ...event,
            user_registered:true,
            current_participants:
              event.current_participants+1
          }

          :

          event

        )

      );



      return {
        success:true
      };


    }catch(error:any){

      return {
        error:error.message
      };

    }

  };





  const unregisterFromEvent = async(eventId:string)=>{


    if(!user){

      return {
        error:'Must be logged in to unregister'
      };

    }


    try{


      await remove(

        ref(
          database,
          `event_participants/${user.uid}/${eventId}`
        )

      );



      setEvents(prev=>

        prev.map(event=>

          event.id===eventId

          ?

          {
            ...event,
            user_registered:false,
            current_participants:
              Math.max(
                0,
                event.current_participants-1
              )
          }

          :

          event

        )

      );



      return {
        success:true
      };


    }catch(error:any){

      return {
        error:error.message
      };

    }

  };






  const getUpcomingEvents = ()=>{

    return events.filter(
      event =>
      new Date(event.start_date) > new Date()
    );

  };





  const getOngoingEvents = ()=>{

    return events.filter(event=>{

      const now = new Date();

      const start =
        new Date(event.start_date);

      const end =
        event.end_date
        ?
        new Date(event.end_date)
        :
        null;


      return (
        start <= now &&
        (!end || end >= now)
      );

    });

  };





  return {

    events,
    loading,
    registerForEvent,
    unregisterFromEvent,
    getUpcomingEvents,
    getOngoingEvents

  };

};
