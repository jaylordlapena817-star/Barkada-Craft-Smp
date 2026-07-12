import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { database } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_name: string;
  product_price: number;
  product_category: string;
  product_image?: string;
  quantity: number;
}

export const useCartDatabase = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);


  // Load cart realtime
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const cartRef = ref(database, `cart_items/${user.uid}`);

    const unsubscribe = onValue(cartRef, snapshot => {
      const data = snapshot.val();

      if (!data) {
        setItems([]);
      } else {
        const list = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value
        }));

        setItems(list);
      }

      setLoading(false);
    });

    return () => unsubscribe();

  }, [user]);


  // Add cart
  const addToCart = async(item: Omit<CartItem,'id'|'quantity'>)=>{

    if(!user){
      toast({
        title:"Login Required",
        description:"Please login first",
        variant:"destructive"
      });
      return;
    }


    const existing = items.find(
      x=>x.product_name === item.product_name
    );


    if(existing){

      await update(
        ref(database,`cart_items/${user.uid}/${existing.id}`),
        {
          quantity: existing.quantity + 1
        }
      );

    }else{

      const newRef = push(
        ref(database,`cart_items/${user.uid}`)
      );


      await set(newRef,{
        ...item,
        quantity:1
      });

    }


    toast({
      title:"Added",
      description:`${item.product_name} added to cart`
    });

  };



  // Update quantity
  const updateQuantity = async(
    id:string,
    quantity:number
  )=>{

    if(!user || quantity < 1) return;


    await update(
      ref(database,`cart_items/${user.uid}/${id}`),
      {
        quantity
      }
    );

  };



  // Remove
  const removeFromCart = async(id:string)=>{

    if(!user)return;


    await remove(
      ref(database,`cart_items/${user.uid}/${id}`)
    );


    toast({
      title:"Removed",
      description:"Item removed"
    });

  };



  // Clear
  const clearCart = async()=>{

    if(!user)return;


    await remove(
      ref(database,`cart_items/${user.uid}`)
    );


    setItems([]);

  };



  const getTotalPrice = ()=>{
    return items.reduce(
      (sum,item)=>
      sum+(item.product_price*item.quantity),
      0
    );
  };


  const getItemCount = ()=>{
    return items.reduce(
      (sum,item)=>sum+item.quantity,
      0
    );
  };


  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemCount
  };

};
