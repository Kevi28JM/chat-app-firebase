import './Chat.css'
import ChatBox from "../../components/ChatBox/ChatBox";
import LeftSideBar from "../../components/LeftSideBar/LeftSideBar";
import RightSideBar from "../../components/RightSideBar/RightSideBar";
import { useEffect } from 'react';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useState } from 'react';

const Chat= ()=>{

  // eslint-disable-next-line no-undef
  const {chatData,userData} = useContext(AppContext);
  // eslint-disable-next-line no-undef
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    if(chatData && userData){
      setLoading(false);
    }
  },[chatData,userData])
    return(
        <div className="chat">
        {
          loading ?
          <p className='loading'>loading...</p>
          : <div className="chat-container">
           <LeftSideBar/> 
           <ChatBox/>
           <RightSideBar/>
         </div>
        }
        </div>
    )
}

export default Chat