import './RightSideBar.css';
import assets from "../../assets/assets";
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';

const RightSideBar = () => {

    const { chatUser, messages } = useContext(AppContext);
    const [msgImages, setMsgImages] = useState([]);

    useEffect(() => {
        let tempVar = [];
        messages.forEach((msg) => {
            msg.message.forEach((m) => {
                if (m.image) {
                    tempVar.push(m.image);
                }
            });
        });
        setMsgImages(tempVar);
    }, [messages]);

    return chatUser ? (
        <div className="rs">
            <div className="rs-profile">
                <img src={chatUser.userData.avatar} alt="" />
                <h3>{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" /> : null} {chatUser.userData.name}</h3>
                <p>{chatUser.userData.bio}</p>
            </div>
            <hr />
            <div className="rs-media">
                <p>Media</p>
                <div>
                    {msgImages.map((url, index) => (<img onClick={() => window.open(url)} src={url} key={index} alt="" />))}
                </div>
            </div>
        </div>
    ) : (
        <div className='rs'>
        </div>
    );
}

export default RightSideBar;