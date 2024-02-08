import { useState, useEffect } from 'react';
import '../styles/threadCard.css';
import Comments from './Comments';

export default function ThreadCard({props}) {
    const [isLiked, setIsLiked] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');
    const [numLikes, setNumLikes] = useState(0);
    const topicName = null;
    const numComments = 0;
    const { post_id, description, name, created_at } = props; 
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [allLikes, setAllLikes] = useState([]);

    const handleLikeClick = async(e) => {
        const body = {postId: post_id};
        console.log(body);
        setIsLiked((prevIsLiked) => !prevIsLiked);
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
        } catch (error) {
            console.error(error.message);
        }
    };

    const formatDate = (created_at) => {
        const date = new Date(created_at);
        return date.toLocaleString(); // Adjust the format as needed
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

    const handleCommentClick = () => {
        setIsCommentOpen((prevIsCommentOpen) => !prevIsCommentOpen);
    };

    const getLikes = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/likes/${post_id}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });

            const parseRes = await response.json();
            setAllLikes(parseRes);
            console.log(allLikes);
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

    return (
        <div className="threadCard">
            <div className='threadHeader'>
                <div className='threadUser'>
                    <p className='userName'>{name}</p>
                    <p className='timeStamp'>{timeAgo}</p>
                </div>
                {topicName && (
                    <div className='threadTopic'>
                        <p className='topicName'>{topicName}</p>
                    </div>
                )}
            </div>
            <div className='threadContent'>
                <p className='content'>{description}</p>
            </div>
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
                        <p className='numLikes'>{numLikes}</p>
                    </div>
                    <div className='threadComments'>
                        <img src='../../assets/reply.svg' alt='comment' className='commentIcon' onClick={handleCommentClick} />
                        <p className='numComments'>{numComments}</p>
                    </div>
                </div>
                {isCommentOpen && <Comments props={post_id}/>}
            </div>
        </div>
    );
}
