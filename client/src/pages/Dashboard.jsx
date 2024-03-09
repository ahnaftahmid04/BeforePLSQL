import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('report');
    const [myUsers, setMyUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [poll_id, setPollId] = useState('');
    const [communitiesCreated, setCommunitiesCreated] = useState(null);
    const [activeCommunities, setActiveCommunities] = useState(null);
    const [activeLocations, setActiveLocations] = useState(null);
    const [verifiedCount, setVerifiedCount] = useState(null);

    const handlePollID = async(post_id) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/polls/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setPollId(parseRes.poll_id);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        deletePoll(poll_id);
    }, [poll_id]);

    const updateUserTag = async (e) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/updateAllUsersTag`, {
                method: 'POST',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();

        } catch (error) {
            console.error(error.message);
        }
    }

    const handleCommunitiesCreated = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/communitiesCreatedLastMonth', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setCommunitiesCreated(parseResponse.communityCount);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleActiveCommunities = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/mostActiveCommunities', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setActiveCommunities(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleActiveLocations = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/mostActiveLocations', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setActiveLocations(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleVerifiedCount = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/verifiedAccounts', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setVerifiedCount(parseResponse.verified_accounts_count);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleCommunitiesCreated();
        handleActiveCommunities();
        handleActiveLocations();
        handleVerifiedCount();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // You can add logic here to fetch and display either followers or following based on the selected tab
        if(tab === 'report') {
            <h1>Report</h1>
        } else if(tab === 'verification') {
            handleVerificationRequests();
        } else {
            console.log('Statistical tab');
        }
    };

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

    const handleVerificationRequests = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/verificationRequests', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyUsers(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleVerificationRequests();
    }, []);

    const handleVerifyUser = async (user_id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/verifyUser/${user_id}`, {
                method: 'PUT',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            handleVerificationRequests();
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleIgnoreRequest = async (request_id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/deleteVerificationRequest/${request_id}`, {
                method: 'DELETE',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            handleVerificationRequests();
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleReports = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/admin/flaggedContent', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setReports(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleReports();
    }, []);

    const deletePost = async(post_id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/posts/${post_id}`, {
                method: 'DELETE',
                headers: {
                    token: localStorage.token,
                },
            });
            const parseRes = await response.json();
            window.location.reload();
        } catch (error) {
            console.error(error.message);
        }
    }

    const deletePoll = async(poll_id) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/polls/${poll_id}`, {
                method: 'DELETE',
                headers: {
                    token: localStorage.token,
                },
            });
            const parseRes = await response.json();
            if(parseRes)
            {
                setPollId(null);
            }
            window.location.reload();
        } catch (error) {
            console.error(error.message);
        }
    }

    const ignoreReport = async(flag_id) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/deleteFlag/${flag_id}`, {
                method: 'DELETE',
                headers: {
                    token: localStorage.token,
                },
            });
            const parseRes = await response.json();
            window.location.reload();
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="followContainer">
            <div className="followHeader">
                <h1>Dashboard</h1>
            </div>
            <div className='navbar'>
                <button
                    className={activeTab === 'report' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('report')}
                >
                    Reports
                </button>
                <button
                    className={activeTab === 'verification' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('verification')}
                >
                    Verification Requests
                </button>
                <button
                    className={activeTab === 'statistics' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('statistics')}
                >
                    Statistics
                </button>
            </div>
            {activeTab == 'verification' && (
                <div className="usersContainer">
                    <ul className="userList">
                        {myUsers && myUsers.length > 0 ? (myUsers.map((user, index) => (
                            <div className='otherUserContainer' key={index}>
                                <div className='otherUserInfo'>
                                    <li key={index} >{user.name}</li>
                                </div>
                                <div className='otherUserButtons'>
                                    <button className='userUnfollowButton' onClick={() => handleVerifyUser(user.user_id)}>Accept</button>
                                    <button className='followerRemoveButton' onClick={() => handleIgnoreRequest(user.request_id)}>Remove</button>
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
            )}
            {activeTab === 'report' && reports && reports.length > 0 && (
                <div className="allThreadsContainer">
                        {reports.map((report, index) => (
                            <div className="threadCard" key={index}>
                                <div className='threadHeader'>
                                    <div className='threadUser'>
                                        <p className='userName'>Flagged By: {report.flagged_by}</p>
                                        <p className='timeStamp'>{calculateTimeAgo(report.timestamp)}</p>
                                    </div>
                                    <div className='threadTopic'>
                                        <button className='userUnfollowButton' onClick={() => ignoreReport(report.flag_id)}>Ignore</button>
                                        {report.post_type !== 'poll' && (
                                            <button className='followerRemoveButton' onClick={() => deletePost(report.post_id)}>Remove</button>
                                        )}
                                        {report.post_type === 'poll' && (
                                            <button className='followerRemoveButton' onClick={() => handlePollID(report.post_id)}>Remove</button>
                                        )}
                                    </div>
                                </div>
                                <div className='flagContent'>
                                    <pre>Post Description: {report.post_description}</pre>
                                    <pre>Reason: {report.reason}</pre>
                                </div>
                            </div>
                    ))}
                </div>
            )}
            {activeTab === 'statistics' && (
                <div className="statisticsContainer">
                    <div className="infoStatCard">
                        <div className="extraInfocard">
                            <div className="firstInfo">
                                <h3>Communities Created Last Month: </h3>
                                <p>{communitiesCreated}</p>
                            </div>
                            <div className="secondInfo">
                                <h3>Verified Count: </h3>
                                <p>{verifiedCount}</p>
                            </div>
                            <button onClick={updateUserTag}>Update User Tags</button>
                        </div>
                    </div>
                    <div className="realInfoCard">
                        <div className="statisticsCard">
                            <h2>Most Active Communities:</h2>
                            {activeCommunities && activeCommunities.length > 0 ? (activeCommunities.map((community, index) => (
                                <div className='otherUserContainer' key={index}>
                                    <div className='otherUserInfo'>
                                        <p>{community.community_name}: {community.post_count} posts</p>
                                    </div>
                                </div>
                            ))): (
                                <div className='noUsersContainer'>
                                    <h1>No communities found</h1>
                                </div>
                            )}
                        </div>
                        <div className="statisticsCard">
                            <h2>Most Active Locations:</h2>
                            {activeLocations && activeLocations.length > 0 ? (activeLocations.map((location, index) => (
                                <div className='otherUserContainer' key={index}>
                                    <div className='otherUserInfo'>
                                        <p>{location.city_name}, {location.country_name}: {location.user_count} users</p>
                                    </div>
                                </div>
                            ))): (
                                <div className='noUsersContainer'>
                                    <h1>No locations found</h1>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}