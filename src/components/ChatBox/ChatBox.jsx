import './ChatBox.css';
import assets from "../../assets/assets";
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ChatBox = () => {

    const { userData, chatUser, messages, messsageId, setMessages, chatVisible } = useContext(AppContext);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        try {
            if (input && messsageId) {
                await updateDoc(doc(db, 'messages', messsageId), {
                    message: arrayUnion({
                        message: input,
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatRef = doc(db, 'chats', id);
                    const userChatsSnap = await getDoc(userChatRef);

                    if (userChatsSnap.exists()) {
                        const userChatData = userChatsSnap.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.message === messsageId);
                        userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                        userChatData.chatsData[chatIndex].updateAt = Date.now();
                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatsData: userChatData.chatsData
                        });
                    }
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
        setInput("");
    }

    const sendImage = async (e) => {
        try {
            // eslint-disable-next-line no-undef
            const fileUrl = await upload(e.target.files[0]);

            if (fileUrl && messsageId) {
                await updateDoc(doc(db, 'messages', messsageId), {
                    message: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                });

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatRef = doc(db, 'chats', id);
                    const userChatsSnap = await getDoc(userChatRef);

                    if (userChatsSnap.exists()) {
                        const userChatData = userChatsSnap.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.message === messsageId);
                        userChatData.chatsData[chatIndex].lastMessage = "Image";
                        userChatData.chatsData[chatIndex].updateAt = Date.now();
                        if (userChatData.chatsData[chatIndex].rId === userData.id) {
                            userChatData.chatsData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatRef, {
                            chatsData: userChatData.chatsData
                        });
                    }
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const convertTimestamp = (timestamp) => {
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        if (hour > 12) {
            return `${hour - 12}:${minute} PM`;
        } else {
            return `${hour}:${minute} AM`;
        }
    }

    useEffect(() => {
        if (messsageId) {
            const unSub = onSnapshot(doc(db, 'messages', messsageId), (res) => {
                setMessages(res.data().message.reverse());
            });
            return () => {
                unSub();
            }
        }
    }, [messsageId, setMessages]);

    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "hidden" : ""}`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</p>
                <img src={assets.help_icon} className="help" alt="" />
                <img onClick={() => (false)} src={assets.arrow_icon} className="arrow" alt="" />
            </div>

            <div className="chat-msg">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {msg.image
                            ? <img src={msg.image} alt="" />
                            : <p className="msg">{msg.text}</p>
                        }
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimestamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Send a message" />
                <input onChange={sendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="" />
            </div>
        </div>
    ) : (
        <div className={`chat-box ${chatVisible ? "hidden" : ""}`}>
            <img src={assets.logo_icon} alt="" />
            <p>Chat anytime, anywhere</p>
        </div>
    );
}

export default ChatBox;