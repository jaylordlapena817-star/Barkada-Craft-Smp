import { 
  createContext, 
  useContext, 
  useEffect, 
  useState 
} from "react";

import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import {
  doc,
  setDoc
} from "firebase/firestore";

import { auth, db } from "@/firebase";


interface AuthContextType {

  user: User | null;

  signUp: (
    email: string,
    password: string,
    minecraftUsername: string,
    displayName: string
  ) => Promise<{ error: any }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any }>;

  signOut: () => Promise<void>;

  loading: boolean;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const useAuth = () => {

  const context = useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

};





export const AuthProvider = ({
  children
}: {
  children: React.ReactNode
}) => {


  const [user, setUser] =
    useState<User | null>(null);


  const [loading, setLoading] =
    useState(true);





  useEffect(() => {


    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);

          setLoading(false);

        }
      );


    return () => unsubscribe();


  }, []);







  const signUp = async (
    email: string,
    password: string,
    minecraftUsername: string,
    displayName: string
  ) => {


    try {


      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );



      console.log(
        "Firebase Auth Created:",
        result.user.uid
      );





      await setDoc(

        doc(
          db,
          "users",
          result.user.uid
        ),

        {

          uid: result.user.uid,

          email: email,

          minecraft_username:
            minecraftUsername,

          display_name:
            displayName,

          createdAt:
            new Date()

        }

      );





      console.log(
        "Firestore user saved"
      );



      return {
        error: null
      };



    } catch (error: any) {


      console.error(
        "SIGNUP ERROR:",
        error
      );


      console.error(
        "ERROR CODE:",
        error.code
      );


      console.error(
        "ERROR MESSAGE:",
        error.message
      );



      return {
        error
      };


    }


  };









  const signIn = async (
    email: string,
    password: string
  ) => {


    try {


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );



      return {
        error: null
      };



    } catch (error:any) {


      console.error(
        "LOGIN ERROR:",
        error.code,
        error.message
      );


      return {
        error
      };


    }


  };









  const signOut = async () => {


    await firebaseSignOut(auth);


  };







  return (

    <AuthContext.Provider

      value={{

        user,

        signUp,

        signIn,

        signOut,

        loading

      }}

    >

      {children}

    </AuthContext.Provider>

  );


};
