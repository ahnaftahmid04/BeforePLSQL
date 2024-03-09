import '../styles/communityProfile.css';
import { useState, useEffect } from 'react';
import ThreadCard from '../components/ThreadCard';
import { Link, useParams } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function CommunityProfile() {
    const [activeTab, setActiveTab] = useState('recent');
    const [myList, setMyList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [thisCommunity, setThisCommunity] = useState({});
    const {communityID} = useParams();
    const [isFollowing, setIsFollowing] = useState('');
    const [activeUser, setActiveUser] = useState('');
    const [rank, setRank] = useState('');

    const getCommunityRank = async () => {
        try {
            const response = await fetch(`http://localhost:5000/communities/communityRank/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setRank(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getCommunityRank();
    }, []);

    async function getName() {
        try {
          const response = await fetch('http://localhost:5000/users/thisUser', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setActiveUser(parseRes);
        } catch (err) {
          console.error(err.message);
        } 
    }
    
    useEffect(() => {
        getName();
    }, []);

    const formatDate = (created_at) => {
        const date = new Date(created_at);
        return date.toLocaleDateString('en-UK');
    };

    const calculateTimeAgo = (created_at) => {
        const currentTime = new Date();
        const postTime = new Date(created_at);
        const timeDifference = currentTime - postTime;

        const seconds = Math.floor(timeDifference / 1000);
        if (seconds < 60) {
            return (`${seconds}s`);
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return (`${minutes}m`);
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return (`${hours}h`);
        }

        return (formatDate(created_at));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'recent') {
            getRecentPosts();
        } else if (tab === 'trending') {
            getTrendingPosts();
        } else if (tab === 'members') {
            handleMemberList();
        }
    }

    const getTrendingPosts = async() => {
        try {
            const response = await fetch(`http://localhost:5000/communities/community/trendingPosts/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getRecentPosts();
    }, []);

    const getRecentPosts = async() => {
        try {
            const response = await fetch(`http://localhost:5000/communities/recentPosts/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
        } catch (err) {
            console.error(err.message);
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
            handleIsFollowing();
        } catch (error) {
            console.error(error.message);
        }
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
            handleIsFollowing();
        } catch (error) {
            console.error(error.message);
        }
    }

    const getCommunity = async () => {
        try {
            const response = await fetch(`http://localhost:5000/communities/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setThisCommunity(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getCommunity();
    }, []);

    const handleMemberList = async () => {
        try {
            const response = await fetch(`http://localhost:5000/communities/members/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setUserList(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleIsFollowing = async () => {
        try {
            const response = await fetch(`http://localhost:5000/communities/checkFollow/${communityID}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setIsFollowing(parseResponse.is_followed);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleRemoveMember = async (username) => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/community/members/${thisCommunity.community_name}/${username}`, {
                method: 'DELETE',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            handleMemberList();
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleMemberList();
        handleIsFollowing();
    }, []);

    return (
        <div className="profile">
            <div className="profileHeader">
                {thisCommunity && (
                    <div className='profileInfo'>
                        <h3 className='profileName'>{thisCommunity.community_name}</h3>
                        <p className='profileUserName'>Created At: {calculateTimeAgo(thisCommunity.creation_date)}</p>
                        <p className='profileLocation'>Topic: {thisCommunity.text}</p>
                        <p className='profileBio'>Description: {thisCommunity.description}</p>
                        <div className='profileStats'>
                            <div className='profileStat'>
                                {userList && <div className='profileStatNumber'>{userList.length}</div>}
                                <div className='profileStatName'>Members</div>
                            </div>
                        </div>
                    </div>
                )}
                <div className='profileButtons'>
                    {isFollowing ?
                    <button className='profileFollowButton' onClick={() => handleUnfollow(thisCommunity.community_name)}>Unfollow</button> :
                    <button className='profileFollowButton' onClick={() => handleFollow(thisCommunity.community_name)}>Follow</button>}
                    <h2 className='profileRank'>Rank: {rank}</h2>
                </div>
            </div>
            <div className="profileBody">
                <div className='profileNavbar'>
                    <button
                        className={activeTab === 'recent' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('recent')}
                    >
                        Recent
                    </button>
                    <button
                        className={activeTab === 'trending' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('trending')}
                    >
                        Trending
                    </button>
                    <button
                        className={activeTab === 'members' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('members')}
                    >
                        Members
                    </button>
                </div>
                <div className="profileThreads">
                    {activeTab !== 'members' ?
                    myList.map((thread) => (
                        <ThreadCard key={thread.post_id} props={thread} />
                    )) : userList.map((user, index) => (
                        <div className='mutualsContainer' key={index}>
                            <p className='mutualsName'>{user.name}</p>
                            <div className='mutualsButtons'>
                                <Link to={`/profile/${user.username}`}>
                                    <button className='mutualsViewButton'>View</button>
                                </Link>
                                {activeUser && thisCommunity && activeUser.id === thisCommunity.admin_id && (
                                    <button className='followerRemoveButton' onClick={() => handleRemoveMember(user.username)}>Remove</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}