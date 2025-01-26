import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyDApe1Hz7vRBmvjNCLz3Z_93aYUQYOdRxY",
  authDomain: "cloud-chat-application-77b8f.firebaseapp.com",
  projectId: "cloud-chat-application-77b8f",
  storageBucket: "cloud-chat-application-77b8f.firebasestorage.app",
  messagingSenderId: "875949770085",
  appId: "1:875949770085:web:a160aa502ca11e4d6d0d8c",
  measurementId: "G-ME27PBRQPX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // For user authentication
const db = getFirestore(app); // For Firestore database

//Signup function
const signup = async (uersname,email, password) => {
  try{
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: uersname.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio:"Hey there i am using chat app",
      lastSeen:Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatData: [],
  })
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(' ')); // Display the error message
  }
}

//login function
const login = async(email,password)=>{
  try{
    await signInWithEmailAndPassword(auth,email,password);
  }catch(error){
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(' ')); // Display the error message
  }
}

// Export the signup function
export { signup , login };