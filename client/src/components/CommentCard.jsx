import '../styles/commentCard.css';
import { useState, useEffect } from 'react';

export default function CommentCard({props}) {
    const [timeAgo, setTimeAgo] = useState('');
    const {description, name, created_at} = props;

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

    return (
        <div className="comment">
            <div className='commentUser'>
                <p className='commentUserName'>{name}</p>
                <p className='commentDate'>{timeAgo}</p>
            </div>
            <div className='commentBody'>
                <p className='commentText'>{description}</p>
            </div>
        </div>
    )
}