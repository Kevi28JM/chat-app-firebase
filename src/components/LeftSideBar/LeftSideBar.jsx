import './LeftSideBar.css';
import assets from "../../assets/assets";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "../../config/firebase"; // Adjusted import path

const LeftSideBar = () => {
    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            const userRef = collection(db, 'users');
            const q = query(userRef, where('username', '==', input.toLowerCase()));
            const querySnap = await getDocs(q);

            if (!querySnap.empty) {
                console.log(querySnap.docs[0].data());
            } else {
                console.log("No matching user found.");
            }
        } catch (err) {
            console.error("Error reading the file: ", err);
        }
    };

    return (
        <div className="ls">
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
                {Array(12).fill("").map((_, index) => (
                    <div className="friends" key={index}>
                        <img src={assets.profile_img} alt="" />
                        <div>
                            <p>Richard Sanford</p>
                            <span>hello How are u?</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeftSideBar;
