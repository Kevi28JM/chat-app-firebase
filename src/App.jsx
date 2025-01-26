import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from 'react-toastify';
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";

const App = () => {

    const navigate = useNavigate();
    const { loadUserData } = useContext(AppContext);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/chat');
                console.log(user);
                loadUserData(user.uid);
            } else {
                navigate('/');
            }
        });
    }, [navigate, loadUserData]);

    return (
        <>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/chat' element={<Chat />} />
                <Route path='/profile' element={<ProfileUpdate />} />
            </Routes>
            <ToastContainer />
        </>
    );
}

export default App;