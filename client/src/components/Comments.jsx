import '../styles/comments.css'
import CommentCard from './CommentCard';
import { useState, useEffect } from 'react';

export default function Comments({props}) {

    const [threadComments, setThreadComments] = useState([]);
    const [myComment, setMyComment] = useState('');

    const getComments = async (e) => {
        try {
            const response = await fetch(`http://localhost:5000/comments/${props}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setThreadComments(parseResponse);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            const body = {description: myComment, postId: props};
            const response = await fetch(`http://localhost:5000/comments/`, {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            });
            const parseResponse = await response.json();
            setMyComment('');
            getComments();
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        getComments();
    }, []);

    useEffect(() => {
        getComments();
    }, [myComment]);

    return (
        <div className="allComments">
            <div className="commentHeader">
                <input 
                    type="text"
                    className="commentInput"
                    placeholder="Add a comment..."
                    value={myComment}
                    onChange={e => setMyComment(e.target.value)}
                />
                <button className="commentButton" onClick={handleReply}>Reply</button>
            </div>
            <div className="commentList">
                {threadComments.map((comment, index) => (
                    <CommentCard props={comment} key={index} />
                ))}
            </div>
        </div>
    )
}