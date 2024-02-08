import '../styles/profile.css';
import { useState, useEffect } from 'react';
import ThreadCard from '../components/ThreadCard';
import { Link, useParams } from 'react-router-dom';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('threads');
    const [myList, setMyList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [otherUser, setOtherUser] = useState('');
    const [otherUsername, setOtherUsername] = useState('');
    const [otherUserBio, setOtherUserBio] = useState('');
    const [otherUserLocation, setOtherUserLocation] = useState('');
    const {userName} = useParams();
    const newUsers = {
        name: 'Shanks',
        username: 'redhair',
        location: 'Elbaf',
        bio: 'Captain of the Red Hair Pirates',
        followers: 100,
        following: 50,
        isFollowing: true
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'threads') {
            getMyThreads();
        } else if (tab === 'likes') {
            getMyThreads();
        } else if (tab === 'replies') {
            getMyThreads();
        } else if (tab === 'mutuals') {
            handleMutuals();
        }
    }

    const getMyThreads = async() => {
        try {
            const response = await fetch(`http://localhost:5000/posts/users/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
            console.log(parseResponse);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFollowing = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/relationships/followings', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setUserList(parseResponse.followings);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleMutuals = async (e) => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/mutuals/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseResponse = await response.json();
            setUserList(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const getUserInfo = async (e) => {
        try {
            const response = await fetch(`http://localhost:5000/users/otherUser/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseResponse = await response.json();
            setOtherUser(parseResponse.name);
            setOtherUsername(parseResponse.username);
            setOtherUserBio(parseResponse.bio);
            setOtherUserLocation(parseResponse.location);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getMyThreads();
    }, []);

    useEffect(() => {
        handleMutuals();
    }, []);

    useEffect(() => {
        getUserInfo();
    }, []);

    return (
        <div className="profile">
            <div className="profileHeader">
                <div className='profileInfo'>
                    <h3 className='profileName'>{otherUser}</h3>
                    <p className='profileUserName'>@{otherUsername}</p>
                    <p className='profileLocation'>Location: {otherUserLocation}</p>
                    <p className='profileBio'>{otherUserBio}</p>
                    <div className='profileStats'>
                        <div className='profileStat'>
                            <div className='profileStatNumber'>{newUsers.followers}</div>
                            <div className='profileStatName'>Followers</div>
                        </div>
                        <div className='profileStat'>
                            <div className='profileStatNumber'>{newUsers.following}</div>
                            <div className='profileStatName'>Followers</div>
                        </div>
                    </div>
                </div>
                <div className='profileButtons'>
                    {newUsers.isFollowing ? 
                    <button className='profileFollowButton'>Unfollow</button> : 
                    <button className='profileFollowButton'>Follow</button>}
                </div>
            </div>
            <div className="profileBody">
                <div className='profileNavbar'>
                    <button
                        className={activeTab === 'threads' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('threads')}
                    >
                        Threads
                    </button>
                    <button
                        className={activeTab === 'likes' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('likes')}
                    >
                        Liked
                    </button>
                    <button
                        className={activeTab === 'replies' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('replies')}
                    >
                        Replied
                    </button>
                    <button
                        className={activeTab === 'mutuals' ? 'activeTab' : ''}
                        onClick={() => handleTabChange('mutuals')}
                    >
                        Mutuals
                    </button>
                </div>
                <div className="profileThreads">
                    {activeTab !== 'mutuals' ?
                    myList.map((thread) => (
                        <ThreadCard key={thread.post_id} props={thread} />
                    )) : userList.map((user, index) => (
                        <div className='mutualsContainer' key={index}>
                            <p className='mutualsName'>{user.name}</p>
                            <button className='mutualsButton'>Unfollow</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}