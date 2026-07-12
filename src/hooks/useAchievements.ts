import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: any;
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: any;
  achievement?: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);

      try {
        // Load all achievements
        const achievementsSnap = await get(ref(db, "achievements"));

        let achievementsList: Achievement[] = [];

        if (achievementsSnap.exists()) {
          achievementsList = Object.entries(achievementsSnap.val()).map(
            ([id, value]: any) => ({
              id,
              ...value,
            })
          );

          achievementsList = achievementsList
            .filter((a) => a.is_active)
            .sort((a, b) => {
              if (a.category === b.category) {
                return a.points - b.points;
              }
              return a.category.localeCompare(b.category);
            });
        }

        setAchievements(achievementsList);

        // Load current user's achievements
        if (user) {
          const userSnap = await get(
            ref(db, `user_achievements/${user.uid}`)
          );

          if (userSnap.exists()) {
            const userList: UserAchievement[] = Object.entries(
              userSnap.val()
            ).map(([id, value]: any) => {
              const achievement = achievementsList.find(
                (a) => a.id === value.achievement_id
              );

              return {
                id,
                ...value,
                achievement,
              };
            });

            setUserAchievements(userList);
          } else {
            setUserAchievements([]);
          }
        } else {
          setUserAchievements([]);
        }
      } catch (err) {
        console.error("Error loading achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const earnedAchievementIds = new Set(
    userAchievements.map((a) => a.achievement_id)
  );

  const earnedAchievements = achievements.filter((a) =>
    earnedAchievementIds.has(a.id)
  );

  const availableAchievements = achievements.filter(
    (a) => !earnedAchievementIds.has(a.id)
  );

  const totalPoints = earnedAchievements.reduce(
    (sum, a) => sum + a.points,
    0
  );

  return {
    achievements,
    userAchievements,
    earnedAchievements,
    availableAchievements,
    totalPoints,
    loading,
  };
};
