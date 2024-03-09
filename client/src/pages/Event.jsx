import { useState, useEffect } from 'react';
import '../styles/follow.css';
import ThreadCard from '../components/ThreadCard';

export default function Event() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('interestedEvents');
    const [myEvents, setMyEvents] = useState([]);

    const handleSearch = async(e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        try {
            const response = await fetch(`http://localhost:5000/posts/events/search?query=${term}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyEvents(parseResponse);
        } catch (error) {
            console.error(error.message);                
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // You can add logic here to fetch and display either followers or following based on the selected tab
        if(tab === 'interestedEvents') {
            handleInterestedEvents();
        } else if(tab === 'cityEvents') {   
            handleCityEvents();
        } else if(tab === 'countryEvents') {
            handleCountryEvents();
        } else if(tab === 'trendingEvents') {
            handleTrendingEvents();
        } else {
            setMyEvents([]);
            setSearchTerm('');
        }
    };

    const handleInterestedEvents = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/posts/events/interested', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyEvents(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleCityEvents = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/posts/events/upcoming/city', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyEvents(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleCountryEvents = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/posts/events/upcoming/country', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyEvents(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleTrendingEvents = async (e) => {
        try {
            const response = await fetch('http://localhost:5000/posts/events/trending', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMyEvents(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleSearch({ target: { value: searchTerm } }); // Pass the event object
    }, [searchTerm]);

    useEffect(() => {
        handleInterestedEvents();
    }, []);

    useEffect(() => {
        handleCityEvents();
    }, []);

    useEffect(() => {
        handleCountryEvents();
    }, []);

    useEffect(() => {
        handleTrendingEvents();
    }, []);

    return (
        <div className="followContainer">
            <div className="followHeader">
                <h1>Events</h1>
            </div>
            <div className='eventNavbar'>
                <button
                    className={activeTab === 'interestedEvents' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('interestedEvents')}
                >
                    Interested
                </button>
                <button
                    className={activeTab === 'cityEvents' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('cityEvents')}
                >
                    City
                </button>
                <button
                    className={activeTab === 'countryEvents' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('countryEvents')}
                >
                    Country
                </button>
                <button
                    className={activeTab === 'trendingEvents' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('trendingEvents')}
                >
                    Trending
                </button>
                <button
                    className={activeTab === 'search' ? 'activeTab' : ''}
                    onClick={() => handleTabChange('search')}
                >
                    Search
                </button>
            </div>
            <div className="eventList">
                {activeTab === 'search' && (
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className='userSearchInput'
                    />
                )}
                <div className="eventList">
                    {myEvents && myEvents.length > 0 ? (myEvents.map((event, index) => (
                        <ThreadCard key={index} props={event} />
                    ))): (
                        <div className='noUsersContainer'>
                            <h1>No events found</h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
