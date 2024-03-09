import MainBar from "../components/MainBar";
import ThreadCard from "../components/ThreadCard";
import '../styles/home.css';
import { useEffect, useState } from "react";

export default function Home({setAuth}) {
    const threadOptions = [
        'All',
        'Following',
        'Community',
        'Events',
        'Interests'
    ];

    const [myThreads, setMyThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState('All');

    const getMyThreads = async() => {
        try {
            if(selectedOption === 'All') {
                const response = await fetch('http://localhost:5000/posts/news/feed', {
                    method: 'GET',
                    headers: {token: localStorage.token}
                });
                const parseResponse = await response.json();
                setMyThreads(parseResponse);
            } else if(selectedOption === 'Community') {
                const response = await fetch('http://localhost:5000/posts/news/feed/community', {
                    method: 'GET',
                    headers: {token: localStorage.token}
                });
                const parseResponse = await response.json();
                setMyThreads(parseResponse);
            } else if(selectedOption === 'Events') {
                const response = await fetch('http://localhost:5000/posts/news/feed/events', {
                    method: 'GET',
                    headers: {token: localStorage.token}
                });
                const parseResponse = await response.json();
                setMyThreads(parseResponse);
            } else if(selectedOption === 'Following') {
                const response = await fetch('http://localhost:5000/posts/news/feed/following', {
                    method: 'GET',
                    headers: {token: localStorage.token}
                });
                const parseResponse = await response.json();
                setMyThreads(parseResponse);
            } else if(selectedOption === 'Interests') {
                const response = await fetch('http://localhost:5000/posts/postsAboutInterestingTopics', {
                    method: 'GET',
                    headers: {token: localStorage.token}
                });
                const parseResponse = await response.json();
                setMyThreads(parseResponse);
            }
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getMyThreads();
    }, []);

    useEffect(() => {
        getMyThreads();
    }, [selectedOption]);

    return (
        <MainBar>
            <div className="homeHeader">
                <h1 className="homeTitle">Home Feed</h1>
                <div className="threadOptionsContainer">
                    <select id="threadOptions" name="threadOptions" onChange={(e) => setSelectedOption(e.target.value)}>
                        {threadOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="allThreadsContainer">
                {loading ? <p>Loading...</p> : 
                myThreads.map(thread => (
                    <ThreadCard key={thread.post_id} props={thread} />
                ))
                }
            </div>
        </MainBar>
    )
}