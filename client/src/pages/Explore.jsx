import { useState, useEffect } from 'react';
import '../styles/explore.css';
import { Link } from 'react-router-dom';

export default function Explore() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('threads');
    const [myThreads, setMyThreads] = useState([]);
    const [myTopics, setMyTopics] = useState([]);

    const handleSearch = async(e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        try {
            const response = await fetch(`http://localhost:5000/users/find/${term}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyUsers(parseResponse);
        } catch (error) {
            console.error(error.message);                
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // You can add logic here to fetch and display either followers or following based on the selected tab
        if(tab === 'threads') {
            setMyThreads([]);
        } else {
            setMyTopics([]);
        }
    };

    return (
        <div className="followContainer">
            <div className="followHeader">
                <h1>Know What's Happening</h1>
            </div>
            <div className='navbar'>
                <button
                    className={activeTab === 'threads' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('threads')}
                >
                    Search Threads
                </button>
                <button
                    className={activeTab === 'topics' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('topics')}
                >
                    Search Topics
                </button>
            </div>
            <div className="usersContainer">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className='userSearchInput'
                />
            </div>
        </div>
    );
}
