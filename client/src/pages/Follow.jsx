import { useState, useEffect } from 'react';
import '../styles/follow.css';
import { Link } from 'react-router-dom';

export default function Follow() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('followers');
    const [myUsers, setMyUsers] = useState([]);

    const handleSearch = async(e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        try {
            const response = await fetch(`http://localhost:5000/users/find/${term}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyUsers(parseResponse);
        } catch (error) {
            console.error(error.message);                
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // You can add logic here to fetch and display either followers or following based on the selected tab
        if(tab === 'followers') {
            handleFollowers();
        } else if(tab === 'following') {   
            handleFollowing();
        } else {
            setMyUsers([]);
        }
    };

    const handleFollowing = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/relationships/followings', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyUsers(parseResponse.followings);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleFollowers = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/relationships/followers', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyUsers(parseResponse.followers);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleFollow = async (username) => {
        try {
            const body = { "followedusername": username };
            const response = await fetch('http://localhost:5000/relationships/follow', {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });
            const parseResponse = await response.json();
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleUnfollow = async (username) => {
        try {
            const body = { "followedusername": username };
            const response = await fetch('http://localhost:5000/relationships/unfollow', {
                method: 'DELETE',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });
            const parseResponse = await response.json();
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleSearch({ target: { value: searchTerm } }); // Pass the event object
    }, [searchTerm]);

    useEffect(() => {
        handleFollowing();
    }, []);

    useEffect(() => {
        handleFollowers();
    }, []);

    const handleRemoveFollower = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/followers/${username}`, {
                method: 'DELETE',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="followContainer">
            <div className="followHeader">
                <h1>Followers and Following</h1>
            </div>
            <div className='navbar'>
                <button
                    className={activeTab === 'followers' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('followers')}
                >
                    Followers
                </button>
                <button
                    className={activeTab === 'following' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('following')}
                >
                    Following
                </button>
                <button
                    className={activeTab === 'search' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('search')}
                >
                    Search
                </button>
            </div>
            <div className="usersContainer">
                {activeTab === 'search' && (
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className='userSearchInput'
                    />
                )}
                <ul className="userList">
                    {myUsers && myUsers.length > 0 ? (myUsers.map((user, index) => (
                        <div className='otherUserContainer' key={index}>
                            <div className='otherUserInfo'>
                                <li key={index} >{user.name}</li>
                            </div>
                            <div className='otherUserButtons'>
                                {activeTab !== 'followers' && (
                                    user.followeduserid || user.followeruserid ? (
                                        <button className='userUnfollowButton' onClick={() => handleUnfollow(user.username)}>Unfollow</button>
                                    ): (
                                        <button className='userFollowButton' onClick={() => handleFollow(user.username)}>Follow</button>
                                    )
                                )}
                                {activeTab === 'followers' && (
                                    <button className='followerRemoveButton' onClick={() => handleRemoveFollower(user.username)}>Remove</button>
                                )
                                }
                                <Link to={`/profile/${user.username}`}>
                                    <button className='userViewButton'>View</button>
                                </Link>
                            </div>
                        </div>
                    ))): (
                        <div className='noUsersContainer'>
                            <h1>No users found</h1>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}
