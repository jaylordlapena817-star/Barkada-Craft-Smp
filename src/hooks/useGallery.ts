import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';


interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  tags: string[];
  author_id: string;
  minecraft_coordinates: string;
  build_time: string;
  materials_used: string[];
  is_featured: boolean;
  is_approved: boolean;
  like_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;

  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}



export const useGallery = () => {

  const [items,setItems] = useState<GalleryItem[]>([]);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    const galleryRef = ref(database,'gallery');


    const unsubscribe = onValue(
      galleryRef,
      (snapshot)=>{


        const data = snapshot.val();


        if(!data){

          setItems([]);
          setLoading(false);
          return;

        }



        const galleryItems:GalleryItem[] = Object.entries(data)

          .map(([id,value]:any)=>({

            id,

            ...value

          }))

          .filter(
            item => item.is_approved === true
          )

          .sort(
            (a,b)=>
              new Date(b.created_at).getTime()
              -
              new Date(a.created_at).getTime()
          );



        setItems(galleryItems);

        setLoading(false);


      },

      (error)=>{

        console.error(
          "Error fetching gallery:",
          error
        );

        setLoading(false);

      }

    );



    return ()=>unsubscribe();


  },[]);





  const getFeaturedItems = ()=>{

    return items.filter(
      item=>item.is_featured
    );

  };





  const getItemsByCategory = (
    category:string
  )=>{

    return items.filter(
      item =>
      item.category === category
    );

  };





  return {

    items,

    loading,

    getFeaturedItems,

    getItemsByCategory

  };

};
