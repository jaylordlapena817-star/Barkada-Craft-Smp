import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';


interface LeaderboardEntry {
  user_id: string;
  value: number;
  rank: number;

  profile?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
}


interface Leaderboard {
  id:string;
  name:string;
  description:string;
  category:string;
  stat_field:string;
  is_active:boolean;
  max_entries?:number;
}



export const useLeaderboards = ()=>{


const [leaderboards,setLeaderboards] =
useState<Leaderboard[]>([]);


const [leaderboardData,setLeaderboardData] =
useState<Record<string,LeaderboardEntry[]>>({});


const [loading,setLoading] =
useState(true);




useEffect(()=>{


const leaderboardRef =
ref(database,'leaderboards');


const unsubscribe =
onValue(
leaderboardRef,
(snapshot)=>{


const data = snapshot.val();


if(!data){

setLeaderboards([]);
setLoading(false);
return;

}



const activeBoards:Leaderboard[] =
Object.entries(data)

.map(([id,value]:any)=>({

id,

...value

}))

.filter(
board=>board.is_active
);



setLeaderboards(activeBoards);



const statsRef =
ref(database,'player_statistics');


onValue(
statsRef,
(statsSnap)=>{


const stats =
statsSnap.val() || {};



const result:
Record<string,LeaderboardEntry[]> = {};




activeBoards.forEach(board=>{



// Achievement leaderboard
if(
board.stat_field === 'achievement_count'
){


const achievementRef =
ref(database,'user_achievements');



onValue(
achievementRef,
(achievementSnap)=>{


const achievements =
achievementSnap.val() || {};


const counts:any = {};



Object.entries(achievements)
.forEach(([uid,value]:any)=>{


const count =
Object.keys(value || {}).length;



counts[uid]={

user_id:uid,

value:count,

profile:
stats[uid]?.profile

};


});



result[board.id] =
Object.values(counts)

.sort(
(a:any,b:any)=>
b.value-a.value
)

.slice(
0,
board.max_entries || 100
)

.map(
(item:any,index)=>({

...item,

rank:index+1

})

);



setLeaderboardData({
...result
});


},
{
onlyOnce:true
}

);


}

else{


const entries =
Object.entries(stats)

.map(([uid,value]:any)=>({


user_id:uid,


value:
Number(
value[board.stat_field] || 0
),


profile:
value.profile


}))


.filter(
item=>item.value>0
)


.sort(
(a,b)=>b.value-a.value
)


.slice(
0,
board.max_entries || 100
)


.map(
(item,index)=>({

...item,

rank:index+1

})

);



result[board.id]=entries;


}



});



setLeaderboardData(result);



},
{
onlyOnce:true
}
);



setLoading(false);



});


return ()=>unsubscribe();



},[]);




return {

leaderboards,

leaderboardData,

loading

};


};
