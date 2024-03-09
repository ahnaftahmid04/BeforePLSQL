import '../styles/profile.css';
import { useState, useEffect } from 'react';
import ThreadCard from '../components/ThreadCard';
import { Link, useParams } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function Profile() {
    const [activeTab, setActiveTab] = useState('threads');
    const [myList, setMyList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [otherUser, setOtherUser] = useState('');
    const {userName} = useParams();
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [followerModalIsOpen, setFollowerModalIsOpen] = useState(false);
    const [followingModalIsOpen, setFollowingModalIsOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState('');

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        if (tab === 'threads') {
            getMyThreads();
        } else if (tab === 'likes') {
            getLikedThreads();
        } else if (tab === 'replies') {
            getCommentedThreads();
        } else if (tab === 'mutuals') {
            handleMutuals();
        }
    }

    const getMyThreads = async() => {
        try {
            const response = await fetch(`http://localhost:5000/posts/news/feed/own/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
        } catch (err) {
            console.error(err.message);
        }
    }

    const getLikedThreads = async() => {
        try {
            const response = await fetch(`http://localhost:5000/posts/likedPosts/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
        } catch (err) {
            console.error(err.message);
        }
    }

    const getCommentedThreads = async() => {
        try {
            const response = await fetch(`http://localhost:5000/posts/commentedPosts/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyList(parseResponse);
        } catch (err) {
            console.error(err.message);
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

    useEffect(() => {
        getMyThreads();
    }, []);

    useEffect(() => {
        handleMutuals();
    }, []);

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

    const getUser = async () => {
        try {
            const response = await fetch(`http://localhost:5000/users/otherUser/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            console.log(parseResponse);
            setOtherUser(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getUser();
    }, []);

    const handleFollowerList = async () => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/followers/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setFollowerList(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleFollowingList = async () => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/followings/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setFollowingList(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleIsFollowing = async () => {
        try {
            const response = await fetch(`http://localhost:5000/relationships/checkFollow/${userName}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setIsFollowing(parseResponse.is_followed);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleFollowerList();
        handleFollowingList();
        handleIsFollowing();
    }, []);

    return (
        <div className="profile">
            <div className="profileHeader">
                {otherUser && (
                    <div className='profileInfo'>
                        <h3 className='profileName'>{otherUser.name}</h3>
                        <p className='profileUserName'>@{otherUser.username}</p>
                        <p className='profileLocation'>Location: {otherUser.city_name}, {otherUser.country_name}</p>
                        <p className='profileBio'>Bio: {otherUser.bio}</p>
                        <div className='profileStats'>
                            <div className='profileStat' onClick={() => setFollowerModalIsOpen(true)}>
                                {followerList && <div className='profileStatNumber'>{followerList.length}</div>}
                                <div className='profileStatName'>Followers</div>
                            </div>
                            <div className='profileStat' onClick={() => setFollowingModalIsOpen(true)}>
                                {followingList && <div className='profileStatNumber'>{followingList.length}</div>}
                                <div className='profileStatName'>Following</div>
                            </div>
                        </div>
                        <Modal
                            isOpen={followerModalIsOpen}
                            onRequestClose={() => setFollowerModalIsOpen(false)}
                            style={{
                                overlay: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                },
                                content: {
                                    width: '30%',
                                    height: '70%',
                                    margin: 'auto',
                                    display: 'flex',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    border: 'none',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    top: '10%',
                                }
                            }}
                        >
                            <h2>Followers</h2>
                            <ul className="userList">
                                {followerList && followerList.length > 0 ? (followerList.map((user, index) => (
                                    <div className='profileUserContainer' key={index}>
                                        <div className='otherUserInfo'>
                                            <li key={index} >{user.name}</li>
                                        </div>
                                        <Link to={`/profile/${user.username}`}>
                                            <button className='profileViewButton'>View</button>
                                        </Link>
                                    </div>
                                ))): (
                                    <div className='noUsersContainer'>
                                        <h1>No users found</h1>
                                    </div>
                                )}
                            </ul>
                        </Modal>
                        <Modal
                            isOpen={followingModalIsOpen}
                            onRequestClose={() => setFollowingModalIsOpen(false)}
                            style={{
                                overlay: {
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                },
                                content: {
                                    width: '30%',
                                    height: '70%',
                                    margin: 'auto',
                                    display: 'flex',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    border: 'none',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    top: '10%',
                                    left: '0%',
                                }
                            }}
                        >
                            <h2>Following</h2>
                            <ul className="userList">
                                {followingList && followingList.length > 0 ? (followingList.map((user, index) => (
                                    <div className='profileUserContainer' key={index}>
                                        <div className='otherUserInfo'>
                                            <li key={index} >{user.name}</li>
                                        </div>
                                        <Link to={`/profile/${user.username}`}>
                                            <button className='profileViewButton'>View</button>
                                        </Link>
                                    </div>
                                ))): (
                                    <div className='noUsersContainer'>
                                        <h1>No users found</h1>
                                    </div>
                                )}
                            </ul>
                        </Modal>
                    </div>
                )}
                <div className='profileButtons'>
                    {isFollowing ?
                    <button className='profileFollowButton' onClick={() => handleUnfollow(userName)}>Unfollow</button> :
                    <button className='profileFollowButton' onClick={() => handleFollow(userName)}>Follow</button>}
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
                            <button className='mutualsButton' onClick={() => handleUnfollow(user.username)}>Unfollow</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}