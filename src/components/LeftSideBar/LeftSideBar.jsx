import { useContext, useState, useEffect } from 'react';
import './LeftSideBar.css';
import assets from "../../assets/assets";
import { arrayUnion, collection, doc, getDocs, query, where, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from "../../config/firebase";
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const LeftSideBar = () => {
    const [users, setUsers] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const { userData, chatData, chatUser, setChatUser, setMessageId, messageId, chatVisible, setChatVisible } = useContext(AppContext);
    const [user] = useState(null);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where('username', '==', input.toLowerCase()));
                const querySnap = await getDocs(q);

                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;
                    chatData.forEach((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    });
                    if (!userExist) {
                        setUsers(querySnap.docs.map((doc) => doc.data()));
                    } else {
                        setUsers([]);
                    }
                } else {
                    setUsers([]);
                }
            } else {
                setShowSearch(false);
            }
        } catch (err) {
            console.error("Error reading the file: ", err);
        }
    };

    const addChat = async () => {
        const messageRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messageRef);
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                message: []
            });
            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });
            const uSnap = await getDocs(query(collection(db, "users"), where('id', '==', user.id)));
            const uData = uSnap.docs[0].data();
            setChatUser({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            });
            setShowSearch(false);
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };

    const setChat = async (item) => {
        try {
            setMessageId(item.messageId);
            setChatUser(item.userData);
            const userChatRef = doc(db, 'chats', userData.id);
            const userChatsSnapshot = await getDocs(userChatRef);
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === item.messageId);
            userChatData.chatsData[chatIndex].messageSeen = true;
            await updateDoc(userChatRef, {
                chatsData: userChatData.chatsData
            });
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const updateChatUserData = async () => {
            if (chatData && chatUser) {
                const userRef = doc(db, 'users', chatUser.userData.id);
                const userSnap = await getDocs(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({ ...prev, userData: userData }));
            }
        };
        updateChatUserData();
    }, [chatData, chatUser, setChatUser]);

    return (
        <div className={`ls ${chatVisible ? "hidden" : ""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className="logo" alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder="Search here.." />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && users.length > 0
                    ? users.map((user, index) => (
                        <div onClick={addChat} className='friends add-user' key={index}>
                            <img src={user.avatar} alt="" />
                            <p>{user.name}</p>
                        </div>
                    ))
                    : chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} className={`friend ${item.messageSeen || item.messageId === messageId ? "" : "border"}`} key={index}>
                            <img src={item.userData.avatar} alt="" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default LeftSideBar;