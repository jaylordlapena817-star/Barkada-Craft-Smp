import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';


interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_id: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  view_count: number;
  created_at: string;
  updated_at: string;

  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}



export const useNews = () => {


  const [articles,setArticles] =
    useState<NewsArticle[]>([]);


  const [loading,setLoading] =
    useState(true);




  useEffect(()=>{


    const newsRef =
      ref(database,'news_articles');



    const unsubscribe =
      onValue(
        newsRef,
        (snapshot)=>{


          const data =
            snapshot.val();



          if(!data){

            setArticles([]);
            setLoading(false);
            return;

          }



          const newsList:NewsArticle[] =
            Object.entries(data)

            .map(([id,value]:any)=>({

              id,

              ...value

            }))


            .filter(
              article =>
              article.is_published === true
            )


            .sort(
              (a,b)=>
              new Date(b.published_at).getTime()
              -
              new Date(a.published_at).getTime()
            );



          setArticles(newsList);

          setLoading(false);



        },

        (error)=>{

          console.error(
            "Error fetching news:",
            error
          );

          setLoading(false);

        }

      );



    return ()=>unsubscribe();



  },[]);






  const getFeaturedArticles = ()=>{

    return articles.filter(
      article =>
      article.is_featured
    );

  };





  const getArticlesByCategory = (
    category:string
  )=>{

    return articles.filter(
      article =>
      article.category === category
    );

  };





  return {

    articles,

    loading,

    getFeaturedArticles,

    getArticlesByCategory

  };

};
