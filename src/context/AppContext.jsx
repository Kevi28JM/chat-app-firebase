import { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null); //The logged-in user's data.
    const [chatData, setChatData] = useState(null); //The user's chat list and messages.
    const [messageId, setMessageId] = useState(null); //The chat messages for the currently open chat.
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null); //The person you're chatting with.
    const [chatVisible, setChatVisible] = useState(false); //Whether the chat interface is visible.

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            //If the user has both an avatar and a name, it navigates them to the chat page (/chat). Otherwise, it takes them to the profile page (/profile).
            setUserData(userData);
            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            //Updates the user's "last seen" timestamp in Firestore every minute.
            await updateDoc(userRef, {
                lastSeen: Date.now()
            });
            setInterval(async () => {
                if (auth.currentUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    });
                }
            }, 60000);
        } catch (error) {
            console.error("Error loading user data: ", error);
        }
    }

    //Real-Time Updates for Chats
    useEffect(() => {
        if (userData) {
            const userRef = doc(db, 'users', userData.uid);
            //The useEffect hook listens for changes to the user's chat data in Firestore.
            const unSub = onSnapshot(userRef, async (res) => {
                const chatItems = res.data().chatsData;
                const tempData = [];

                //For each chat, it fetches additional details (like chat messages) from the Firestore chats collection.
                for (const item of chatItems) {
                    const chatRef = doc(db, 'chats', item.rId);
                    const chatSnap = await getDoc(chatRef);
                    const chatData = chatSnap.data();
                    tempData.push({ ...item, chatData });
                }

                //The chat list is sorted by the most recent update (updateAt) before being stored in chatData.
                setChatData(tempData.sort((a, b) => b.updateAt - a.updateAt));
            });
            return () => {
                unSub();
            };
        }
    }, [userData]);

    const value = {
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
        messages,
        setMessages,
        messageId,
        setMessageId,
        chatUser,
        setChatUser,
        chatVisible,
        setChatVisible
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppContextProvider;