import { useState, useEffect } from 'react';
import '../styles/threadCard.css';
import Comments from './Comments';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

Modal.setAppElement('#root');

export default function ThreadCard({props}) {
    const [isLiked, setIsLiked] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');
    const [numLikes, setNumLikes] = useState('');
    const [numComments, setNumComments] = useState('');
    const { eventid, event_name, event_scheduled_time, post_id, post_type, event_city_name, event_country_name, name, description, created_at, community_name, topic_name, username, verified_status} = props; 
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [allLikes, setAllLikes] = useState([]);
    const [allComments, setAllComments] = useState([]);
    const [currUserName, setCurrUserName] = useState('');
    const [reason, setReason] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [likeModalIsOpen, setLikeModalIsOpen] = useState(false);
    const [allUsersLiked, setAllUsersLiked] = useState([]);
    const [allPollOptions, setAllPollOptions] = useState([]);
    const [poll_id, setPollId] = useState('');
    const [pollClicked, setPollClicked] = useState(false);
    const [optionVoters, setOptionVoters] = useState([]);
    const [optionVotersModalIsOpen, setOptionVotersModalIsOpen] = useState(false);
    const [selectedPollOption, setSelectedPollOption] = useState(null);

    const handlePollOptionVoters = async(option_id) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/pollOptions/${option_id}/voters`, {
                method: "GET",
                headers: { token: localStorage.token },
            });
            const parseRes = await response.json();
            setOptionVoters(parseRes.voters);
            setOptionVotersModalIsOpen(true);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handlePollVote = async(e) => {
        try {
            const body = {
                "poll_id": poll_id, 
                "option_id": e.target.value
            };
            const response = await fetch('http://localhost:5000/posts/pollOptions/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.token,
                },
                body: JSON.stringify(body),
            });
            const parseRes = await response.json();
            getPollOptions();
            setPollClicked(true);
            setSelectedPollOption(e.target.value);
        } catch (error) {
            console.error(error.message);
        }
    }

    const getPollOptions = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/pollOptions/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });

            const parseRes = await response.json();
            setAllPollOptions(parseRes.options);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        if(post_type === 'poll') {
            getPollOptions();
            handlePollID();
        }
    }, []);

    const handlePollID = async(e) => {
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

    async function getName() {
        try {
          const response = await fetch('http://localhost:5000/users/thisUser', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setCurrUserName(parseRes.username);
        } catch (err) {
          console.error(err.message);
        } 
    }
    
    useEffect(() => {
        getName();
    }, []);

    const handlePostAlreadyLiked = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/likes/threads/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });
            const parseResponse = await response.json();
            if(parseResponse.length !== 0) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handlePostAlreadyLiked();
    }, []);

    const handleLikeClick = async(e) => {
        const body = {postId: post_id};
        if(!isLiked) {
            try {
                const response = await fetch("http://localhost:5000/likes/", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        token: localStorage.token,
                    },
                    body: JSON.stringify(body),
                });

                const parseRes = await response.json();
                getLikes();
                handlePostAlreadyLiked();
            } catch (error) {
                console.error(error.message);
            }
        } else {
            try {
                const response = await fetch(`http://localhost:5000/likes/threads/${post_id}`, {
                    method: "DELETE",
                    headers: { token: localStorage.token },
                });
                const parseResponse = await response.json();
                getLikes();
                handlePostAlreadyLiked();
            } catch (error) {
                console.error(error.message);
            }
        }
    };

    const formatDate = (created_at) => {
        const date = new Date(created_at);
        return date.toLocaleDateString('en-UK');
    };

    const formatTime = (created_at) => {
        const date = new Date(created_at);
        return date.toLocaleTimeString(); // Adjust the format as needed
    };

    const calculateTimeAgo = (created_at) => {
        const currentTime = new Date();
        const postTime = new Date(created_at);
        const timeDifference = currentTime - postTime;

        const seconds = Math.floor(timeDifference / 1000);
        if (seconds < 60) {
            setTimeAgo(`${seconds} seconds ago`);
            return;
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            setTimeAgo(`${minutes} minutes ago`);
            return;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            setTimeAgo(`${hours} hours ago`);
            return;
        }

        // If more than 24 hours, return the formatted date
        setTimeAgo(formatDate(created_at));
    };

    const handleCommentClick = async(e) => {
        setIsCommentOpen((prevIsCommentOpen) => !prevIsCommentOpen);
    };

    const getComments = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/comments/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });

            const parseRes = await response.json();
            setAllComments(parseRes);
            setNumComments(allComments.length);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getComments();
    }, []);

    useEffect(() => {
        getComments();
    }, [numComments]);

    const getLikes = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/likes/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });

            const parseRes = await response.json();
            setAllLikes(parseRes);
            setNumLikes(allLikes.length);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getLikes();
    }, [numLikes]);

    useEffect(() => {
        calculateTimeAgo(created_at);
    }, [created_at]);

    const eventDescription = `Event: ${event_name}\nEvent Description: ${description}\nScheduled Date: ${formatDate(event_scheduled_time)}\nScheduled Time: ${formatTime(event_scheduled_time)}\nLocation: ${event_city_name}, ${event_country_name}`;

    const handleFlagContent = async(e) => {
        setModalIsOpen(false);
        try {
            const body = {"post_id": post_id, "reason": reason};
            const response = await fetch('http://localhost:5000/admin/flagContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: localStorage.token,
                },
                body: JSON.stringify(body),
            });
            const parseRes = await response.json();
        } catch (error) {
            console.error(error.message);
        }
    }

    const deletePost = async(e) => {
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

    const deletePoll = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/polls/${poll_id}`, {
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

    const handleAllUsersLiked = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/likes/likedUsers/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });
            const parseResponse = await response.json();
            setAllUsersLiked(parseResponse);
        }
        catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleAllUsersLiked();
    }, []);

    return (
        <div className="threadCard">
            <div className='threadHeader'>
                <div className='threadUser'>
                    <p className='userName'>{name}</p>
                    <p className='timeStamp'>{timeAgo}</p>
                    {community_name && <p className='topicName'>{community_name}</p>}
                </div>
                {topic_name && post_type === 'thread' && (
                    <div className='threadTopic'>
                        {username === currUserName || username === 'admin' ? 
                            <button className='followerRemoveButton' onClick={() => deletePost()}>Remove</button> : 
                            <button className='followerRemoveButton' onClick={() => setModalIsOpen(true)}>Report</button>}
                        <p className='topicName'>{topic_name}</p>
                    </div>
                )}
                {post_type === 'event' && (
                    <div className='threadTopic'>
                        {username === currUserName || username === 'admin' ? 
                            <button className='followerRemoveButton' onClick={() => deletePost()}>Remove</button> : 
                            <button className='followerRemoveButton' onClick={() => setModalIsOpen(true)}>Report</button>}
                        <p className='topicName'>Event</p>
                    </div>
                )}
                {post_type === 'community_post' && (
                    <div className='threadTopic'>
                        {username === currUserName || username === 'admin' ? 
                            <button className='followerRemoveButton' onClick={() => deletePost()}>Remove</button> : 
                            <button className='followerRemoveButton' onClick={() => setModalIsOpen(true)}>Report</button>}
                        <p className='topicName'>Community Post</p>
                    </div>
                )}
                {post_type === 'community_event' && (
                    <div className='threadTopic'>
                        {username === currUserName || username === 'admin' ? 
                            <button className='followerRemoveButton' onClick={() => deletePost()}>Remove</button> : 
                            <button className='followerRemoveButton' onClick={() => setModalIsOpen(true)}>Report</button>}
                        <p className='topicName'>Community Event</p>
                    </div>
                )}
                {post_type === 'poll' && (
                    <div className='threadTopic'>
                        {username === currUserName || username === 'admin' ? 
                            <button className='followerRemoveButton' onClick={() => deletePoll()}>Remove</button> :
                            <button className='followerRemoveButton' onClick={() => setModalIsOpen(true)}>Report</button>}
                        <p className='topicName'>Poll</p>
                        <p className='topicName'>{topic_name}</p>
                    </div>
                )}
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        content: {
                            width: '25%',
                            height: '25%',
                            margin: 'auto',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#111214',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                        },
                    }}
                >
                    <input type='text' placeholder='Reason for flagging' onChange={(e) => setReason(e.target.value)}></input>
                    <button onClick={() => handleFlagContent()} className='flagButton'>Submit</button>
                </Modal>
            </div>
            <div className='threadContent'>
                {post_type === 'event' ? <pre className='content'>{eventDescription}</pre> : <pre className='content'>{description}</pre>}
            </div>
            {post_type === 'poll' && (
                <div className='allPollOptions'>
                    {allPollOptions && allPollOptions.map((option, index) => (
                        <div className='myPollOption' key={index}>
                            <input
                                type='radio'
                                id={option.option_id}
                                name='pollOption'
                                value={option.option_id}
                                onClick={handlePollVote}
                                className={selectedPollOption === option.option_id ? 'selectedPollOption' : 'pollOptionInput'}
                                disabled={pollClicked}
                            />
                            <label htmlFor={option.option_id}>{option.option_name}</label>
                            {pollClicked && <p className='pollVoteCount' onClick={() => handlePollOptionVoters(option.option_id)}>{option.vote_count} votes</p>}
                        </div>
                    ))}
                </div>
            )}
            <Modal
                isOpen={optionVotersModalIsOpen}
                onRequestClose={() => setOptionVotersModalIsOpen(false)}
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
                <h2>Voted By</h2>
                <ul className="userList">
                    {optionVoters && optionVoters.length > 0 ? (optionVoters.map((user, index) => (
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
            <div className='threadFooter'>
                <div className='threadActions'>
                    <div className='threadLikes'>
                        <button className='likeButton' onClick={handleLikeClick}>
                            <img
                                src={`../../assets/${isLiked ? 'heart-filled.svg' : 'heart-gray.svg'}`}
                                alt='heart'
                                className='heartIcon'
                            />
                        </button>
                        {numLikes && <p className='numLikes' onClick={() => setLikeModalIsOpen(true)}>{numLikes}</p>}
                        <Modal
                            isOpen={likeModalIsOpen}
                            onRequestClose={() => setLikeModalIsOpen(false)}
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
                            <h2>Users who liked the post</h2>
                            <ul className="userList">
                                {allUsersLiked && allUsersLiked.length > 0 ? (allUsersLiked.map((user, index) => (
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
                    <div className='threadComments'>
                        <img src='../../assets/reply.svg' alt='comment' className='commentIcon' onClick={handleCommentClick} />
                        {allComments && <p className='numComments'>{numComments}</p>}
                    </div>
                </div>
                {post_type === 'event' ? (
                    isCommentOpen && <Comments props={post_id}/>
                ) : (
                    isCommentOpen && <Comments props={post_id}/>
                )}
            </div>
        </div>
    );
}
