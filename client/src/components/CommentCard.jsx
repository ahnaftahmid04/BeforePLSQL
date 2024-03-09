import '../styles/commentCard.css';
import { useState, useEffect } from 'react';

export default function CommentCard({props}) {
    const [timeAgo, setTimeAgo] = useState('');
    const {description, name, created_at, comment_id, id} = props;
    const [userId, setUserId] = useState('');

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

    useEffect(() => {
        calculateTimeAgo(created_at);
    }, [created_at]);

    async function getUser() {
        try {
          const response = await fetch('http://localhost:5000/users/thisUser', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setUserId(parseRes.id);
        } catch (err) {
          console.error(err.message);
        } 
    }
    
    useEffect(() => {
        getUser();
    }, []);

    const handleRemoveComment = async(e) => {
        try {
            const response = await fetch(`http://localhost:5000/comments/${comment_id}`, {
                method: 'DELETE',
                headers: { token: localStorage.token},
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="comment">
            <div className='commentUser'>
                <p className='commentUserName'>{name}</p>
                <p className='commentDate'>{timeAgo}</p>
                {userId === id && (
                    <div className='threadTopic'>
                        <button className='followerRemoveButton' onClick={() => handleRemoveComment()}>Remove</button>
                    </div>
                )}
            </div>
            <div className='commentBody'>
                <p className='commentText'>{description}</p>
            </div>
        </div>
    )
}