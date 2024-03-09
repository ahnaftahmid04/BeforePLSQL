import '../styles/rightsidebar.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RightSideBar() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [globalTrending, setGlobalTrending] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [suggestedCommunities, setSuggestedCommunities] = useState([]);
    const { pathname } = useLocation();
    const [isVerified, setIsVerified] = useState('');

    async function getName() {
        try {
          const response = await fetch('http://localhost:5000/users/thisUser', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setUsername(parseRes.username);
            setName(parseRes.name);
            setIsVerified(parseRes.verified_status);
        } catch (err) {
          console.error(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        getName();
    }, []);

    async function getSuggestedUsers() {
        try {
          const response = await fetch('http://localhost:5000/relationships/suggestions', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setSuggestedUsers(parseRes);
        } catch (err) {
          console.error(err.message);
        }
    }

    useEffect(() => {
        getSuggestedUsers();
    }, []);

    async function getTrendingTopics() {
        try {
          const response = await fetch('http://localhost:5000/topics/trending/1', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setGlobalTrending(parseRes);
        } catch (err) {
          console.error(err.message);
        }
    }
    
    useEffect(() => {
        getTrendingTopics();
    }, []);

    async function getSuggestedCommunities() {
        try {
          const response = await fetch('http://localhost:5000/communities/suggested/1', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setSuggestedCommunities(parseRes);
        } catch (err) {
          console.error(err.message);
        }
    }

    useEffect(() => {
        getSuggestedCommunities();
    }, []);

    const handleVerificationRequest = async () => {
        try {
          const response = await fetch('http://localhost:5000/admin/requestVerification', {
            method: 'POST',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
        } catch (err) {
          console.error(err.message);
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
            getSuggestedUsers();
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="rightsidebar">
            <div className='userProfile'>
                {loading ? <p>Loading...</p> : (
                <div className='userDetailsContainer' to={`/account/${username}`}>
                    <div className='verifiedBar'>
                        {!isVerified && <button className='requestVerification' onClick={handleVerificationRequest}>Request Verification</button>}
                        <div className='verifiedIcon'>
                            <h3 className='actualName'>{name}</h3>
                            {isVerified && <img src='../assets/anotherVerified.svg' alt='verified' className='verifiedImage'/>}
                        </div>
                    </div>
                    <Link to={`/account/${username}`} className='userLink'>
                        <p className='rightUserName'>@{username}</p>
                    </Link>
                </div>
                )}
            </div>
            {pathname !== '/communities' ? (
                <div className='trendingTopics'>
                    <h3 className='trendingTitle'>Trending</h3>
                    <div className='trendingContent'>
                        {globalTrending && globalTrending.length > 0 && globalTrending.map((topic, index) => (
                            <div key={index} className='trendingTopic'>
                                <div className='topicDetails'>
                                    <p className='rightTopicName'>{topic.topic_name}</p>
                                    <p className='topicThreads'>{topic.popularity_score} Posts</p>
                                </div>
                                <Link to='/' className='topicLink'>
                                    <button className='topicButton'>View</button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='trendingTopics'>
                    <h3 className='trendingTitle'>Suggested Communities</h3>
                    <div className='trendingContent'>
                        {suggestedCommunities && suggestedCommunities.map((community, index) => (
                            <div key={index} className='trendingTopic'>
                                <div className='topicDetails'>
                                    <p className='rightTopicName'>{community.community_name}</p>
                                    <p className='topicThreads'>{community.member_count} Members</p>
                                </div>
                                <Link to={`/community/${community.community_id}`} className='topicLink'>
                                    <button className='topicButton'>View</button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className='suggestedUsers'>
                <h3 className='suggestedTitle'>Similar Minds</h3>
                <div className='suggestedContent'>
                    {suggestedUsers && suggestedUsers.map((mind, index) => (
                        <div key={index} className='suggestedUser'>
                            <div className='userDetails'>
                                <p className='mindName'>{mind.name}</p>
                                <p className='mindMutuals'>{mind.mutual_count} Mutuals</p>
                            </div>
                            <button className='followButton' onClick={() => handleFollow(mind.username)}>Follow</button>
                        </div>
                    ))}
                </div>            
            </div>
        </div>
    )
}