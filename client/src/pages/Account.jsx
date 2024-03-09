import { useState, useEffect } from "react";
import "../styles/account.css";

export default function Account() {
    const [favouriteCommunities, setFavouriteCommunities] = useState([]);
    const [favouriteUsers, setFavouriteUsers] = useState([]);
    const [favouriteChatters, setFavouriteChatters] = useState([]);
    const [favouriteTopics, setFavouriteTopics] = useState([]);
    const [tag, setTag] = useState("");

    const handleUserTag = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/userTag', {
                method: 'GET',
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setTag(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFavouriteCommunities = async () => {
        try {
            const response = await fetch('http://localhost:5000/communities/favoriteCommunities/1', {
                method: 'GET',
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setFavouriteCommunities(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFavouriteUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/topLikedUsers', {
                method: 'GET',
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setFavouriteUsers(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFavouriteChatters = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/topChattedUsers', {
                method: 'GET',
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setFavouriteChatters(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFavouriteTopics = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/userInterestingTopics', {
                method: 'GET',
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setFavouriteTopics(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        handleFavouriteCommunities();
        handleFavouriteUsers();
        handleFavouriteChatters();
        handleFavouriteTopics();
        handleUserTag();
    }, []);

    return (
        <div className="myAccount">
            <div className="accountHeader">
                <h1>Account Overview</h1>
                <div className="accountTag">
                    {tag && <h2>Tag: {tag}</h2>}
                    {
                        tag && tag === "Extrovert" && (
                            <p>You prefer to express your views more</p>
                        )
                    }
                    {
                        tag && tag === "Introvert" && (
                            <p>You prefer to listen more</p>
                        )
                    }
                    {
                        tag && tag === "ChatPro" && (
                            <p>You prefer to talk more</p>
                        )
                    }
                </div>
            </div>
            <div className="accountDetails">
                <div className="accountStats">
                    <div className="accountInfo">
                        <h2>Favourite Communities</h2>
                        <div className="favouriteStuffs">
                            {favouriteCommunities.map((community, index) => {
                                return <p key={index}>{community.community_name}</p>
                            })}
                        </div>
                    </div>
                    <div className="accountInfo">
                        <h2>Favourite Users</h2>
                        <div className="favouriteStuffs">
                            {favouriteUsers.map((user, index) => {
                                return <p key={index}>{user.name}</p>
                            })}
                        </div>
                    </div>
                </div>
                <div className="accountStats">
                    <div className="accountInfo">
                        <h2>Favourite Chatters</h2>
                        <div className="favouriteStuffs">
                            {favouriteChatters.map((user, index) => {
                                return <p key={index}>{user.name}</p>
                            })}
                        </div>
                    </div>
                    <div className="accountInfo">
                        <h2>Favourite Topics</h2>
                        <div className="favouriteStuffs">
                            {favouriteTopics.map((topic, index) => {
                                return <p key={index}>{topic.topic_name}</p>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}