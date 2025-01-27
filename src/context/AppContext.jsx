import { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messageId, setMessageId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);
            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }
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

    useEffect(() => {
        if (userData) {
            const userRef = doc(db, 'users', userData.uid);
            const unSub = onSnapshot(userRef, async (res) => {
                const chatItems = res.data().chatsData;
                const tempData = [];
                for (const item of chatItems) {
                    const chatRef = doc(db, 'chats', item.rId);
                    const chatSnap = await getDoc(chatRef);
                    const chatData = chatSnap.data();
                    tempData.push({ ...item, chatData });
                }
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