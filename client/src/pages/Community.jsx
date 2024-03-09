import { useState, useEffect } from 'react';
import '../styles/follow.css';
import { Link } from 'react-router-dom';

export default function Community() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('following');
    const [myCommunities, setMyCommunities] = useState([]);

    const handleSearch = async(e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        try {
            const response = await fetch(`http://localhost:5000/communities/search/${term}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyCommunities(parseResponse);
        } catch (error) {
            console.error(error.message);                
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // You can add logic here to fetch and display either followers or following based on the selected tab
        if(tab === 'following') {
            handleFollowing();
        } else {
            setMyCommunities([]);
        }
    };

    const handleFollowing = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/communities/follows/1', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyCommunities(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleFollow = async (community_name) => {
        try {
            const body = { "community_name": community_name };
            const response = await fetch('http://localhost:5000/relationships/join/community', {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            });
            const parseResponse = await response.json();
        } catch (error) {
            console.error(error.message);
        }
        setSearchTerm('');
    }

    const handleUnfollow = async (community_name) => {
        try {
            const body = { "community_name": community_name };
            const response = await fetch('http://localhost:5000/relationships/leave/community', {
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

    return (
        <div className="followContainer">
            <div className="followHeader">
                <h1>Communities</h1>
            </div>
            <div className='navbar'>
                <button
                    className={activeTab === 'following' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('following')}
                >
                    My Communities
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
                        placeholder="Search communities..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className='userSearchInput'
                    />
                )}
                <ul className="userList">
                    {myCommunities && Array.isArray(myCommunities) && myCommunities.length > 0 ? (myCommunities.map((community, index) => (
                        <div className='otherUserContainer' key={index}>
                            <div className='otherUserInfo'>
                                {activeTab === 'following' ? (
                                    <li key={index} >{community.community_name}</li>
                                ) : (
                                    <li key={index} >{community.community_name}</li>
                                )}
                            </div>
                            <div className='otherUserButtons'>
                                {activeTab !== 'following' && (
                                    community.user_follows ? (
                                        <button className='userUnfollowButton' onClick={() => handleUnfollow(community.community_name)}>Unfollow</button>
                                    ): (
                                        <button className='userFollowButton' onClick={() => handleFollow(community.community_name)}>Follow</button>
                                    )
                                )}
                                {activeTab === 'following' && (
                                    <button className='followerRemoveButton' onClick={() => handleUnfollow(community)}>Remove</button>
                                )
                                }
                                <Link to={`/community/${community.community_id}`}>
                                    <button className='userViewButton'>View</button>
                                </Link>
                            </div>
                        </div>
                    ))): (
                        <div className='noUsersContainer'>
                            <h1>No communities found</h1>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
}
