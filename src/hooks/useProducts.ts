import { useQuery } from "@tanstack/react-query";
import { ref, get } from "firebase/database";
import { db } from "@/firebase";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tier?: string;
  features?: string[];
  is_active: boolean;
  is_popular: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: string;
  features?: string[];
  rcon_commands?: string[];
  is_active: boolean;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const snapshot = await get(ref(db, "products"));

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([id, value]: any) => ({
        id,
        ...value,
      })) as Product[];
    },
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: async () => {
      const snapshot = await get(ref(db, "payment_plans"));

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([id, value]: any) => ({
        id,
        ...value,
      })) as PaymentPlan[];
    },
  });

  const activeProducts = (products || [])
    .filter((p) => p.is_active)
    .sort((a, b) => a.price - b.price);

  const activePlans = (plans || [])
    .filter((p) => p.is_active)
    .sort((a, b) => a.amount - b.amount);

  const getProductsByCategory = (category: string) =>
    activeProducts.filter((p) => p.category === category);

  return {
    products: activeProducts,
    plans: activePlans,
    isLoading: isLoadingProducts || isLoadingPlans,
    getProductsByCategory,
  };
};
