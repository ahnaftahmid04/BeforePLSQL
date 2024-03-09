import { useState, useEffect } from 'react';
import '../styles/create.css';
import moment from 'moment';

export default function Create() {
    const createOptions = ['Thread', 'Event', 'Community', 'Polls'];
    const postingOptions = ['Followers', 'Community'];
    const currentTime = moment().seconds(0).format('YYYY-MM-DDTHH:mm:ss');

    const [selectedOption, setSelectedOption] = useState('');
    const [topicName, setTopicName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPostingOption, setSelectedPostingOption] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [allTopics, setAllTopics] = useState([]);
    const [eventName, setEventName] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [city_name, setCityName] = useState('');
    const [country_name, setCountryName] = useState('');
    const [post_id, setPostId] = useState(''); // TODO: Get post_id from the server after creating a post
    const [followedCommunities, setFollowedCommunities] = useState([]);
    const [isPostIdRetrieved, setIsPostIdRetrieved] = useState(false);
    const [allCountries, setAllCountries] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [poll_id, setPollId] = useState(''); // TODO: Get poll_id from the server after creating a poll
    const [pollOptions, setPollOptions] = useState([]); // Initialize with an empty array
    const [newPollOption, setNewPollOption] = useState('');
    const [isPollIdRetrieved, setIsPollIdRetrieved] = useState(false);

    const handleAddOption = () => {
        if (newPollOption.trim() !== '') {
            setPollOptions([...pollOptions, newPollOption]);
            setNewPollOption(''); // Clear the input field after adding
        }
    };

    const handleRemoveOption = (index) => {
        const newOptions = [...pollOptions];
        newOptions.splice(index, 1);
        setPollOptions(newOptions);
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    const handleTopicNameChange = (event) => {
        setTopicName(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handlePostingOptionChange = (event) => {
        setSelectedPostingOption(event.target.value);
    };

    const handleCommunityChange = (event) => {
        setSelectedCommunity(event.target.value);
    };

    const handleEventNameChange = (event) => {
        setEventName(event.target.value);
    }

    const handleScheduledTimeChange = (event) => {
        const { value } = event.target;

        // Create a new moment object with the selected time
        const selectedTime = moment(value);

        // Set seconds to 0
        const updatedTime = selectedTime.seconds(0);

        // Update the state with the formatted time
        setScheduledTime(updatedTime.format('YYYY-MM-DDTHH:mm:ss'));
    }

    const handleCityNameChange = (event) => {
        setCityName(event.target.value);
    }

    const handleCountryNameChange = (event) => {
        setCountryName(event.target.value);
    }

    async function fetchTopics() {
        try {
            const response = await fetch('http://localhost:5000/topics/', {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseRes = await response.json();
            setAllTopics(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        fetchTopics();
    }, []);

    async function fetchFollowedCommunities() {
        try {
            const response = await fetch('http://localhost:5000/communities/follows/1', {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseRes = await response.json();
            setFollowedCommunities(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        fetchFollowedCommunities();
    }, []);

    async function fetchAllCountries() {
        try {
            const response = await fetch('http://localhost:5000/locations/countries', {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseRes = await response.json();
            setAllCountries(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        fetchAllCountries();
    }, []);

    async function fetchAllCities() {
        try {
            const response = await fetch(`http://localhost:5000/locations/cities/${country_name}`, {
                method: 'GET',
                headers: {token: localStorage.token},
            });
            const parseRes = await response.json();
            setAllCities(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        if (country_name) {
            fetchAllCities();
        }
    }, [country_name]);

    useEffect(() => {
        // Check if post_id is retrieved
        if (post_id !== '' && !isPostIdRetrieved && selectedOption === 'Event') {
            // Call the function to create event only if post_id is retrieved and not already processed
            createEvent();
            // Set the flag to true to prevent repeated calls
            setIsPostIdRetrieved(true);
        }
    }, [post_id, isPostIdRetrieved]);
    
    // Function to create event
    const createEvent = async () => {
        const eventBody = {
            "eventName": eventName,
            "scheduledTime": scheduledTime,
            "city_name": city_name,
            "country_name": country_name,
            "post_id": post_id
        };
        try {
            const response = await fetch('http://localhost:5000/posts/events/', {
                method: 'POST',
                headers: { token: localStorage.token, 'Content-Type': 'application/json' },
                body: JSON.stringify(eventBody),
            });
            // Handle the response if needed
        } catch (err) {
            console.error(err.message);
        }
    };

    const createPollInPost = async () => {
        const pollBody = {
            "post_id": post_id,
        };
        try {
            const response = await fetch('http://localhost:5000/posts/polls/', {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(pollBody),
            });

            const parseRes = await response.json();
            setPollId(parseRes.poll_id);
            console.log(parseRes);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        // Check if poll_id is retrieved
        if (post_id !== '' && !isPostIdRetrieved && selectedOption === 'Polls') {
            // Call the function to create poll options only if poll_id is retrieved and not already processed
            console.log(post_id);
            createPollInPost();
            // Set the flag to true to prevent repeated calls
            setIsPostIdRetrieved(true);
        }
    }, [post_id, isPostIdRetrieved]);

    const createPollOptions = async () => {
        const pollOptionsBody = {
            "poll_id": poll_id,
            "options": pollOptions
        };
        console.log(pollOptionsBody);
        try {
            const response = await fetch('http://localhost:5000/posts/pollOptions', {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(pollOptionsBody),
            });
            const parseRes = await response.json();
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        // Check if poll_id is retrieved
        if (poll_id !== '' && !isPollIdRetrieved && selectedOption === 'Polls') {
            // Call the function to create poll options only if poll_id is retrieved and not already processed
            console.log(poll_id);
            createPollOptions();
            // Set the flag to true to prevent repeated calls
            setIsPollIdRetrieved(true);
        }
    }, [poll_id, isPollIdRetrieved]);

    const handleSubmit = async(event) => {
        event.preventDefault();
        if (selectedOption === 'Thread' && selectedPostingOption === 'Followers') {
            // TODO: Handle the form submission (e.g., send data to server, perform actions)
            const body = {
                "description": description,
                "img": null,
                "topic_text": topicName,
                "post_type": selectedOption === 'Thread' ? 'thread' : 'Event' ? 'event' : 'Community' ? 'community' : 'poll'
            };
            try {
                // Reset form fields if needed
                setTopicName('');
                setDescription('');
                setSelectedCommunity('');
                setSelectedPostingOption('');

                const response = await fetch('http://localhost:5000/posts/', {
                    method: 'POST',
                    headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                });
                const parseRes = await response.json();
                setPostId(parseRes);
            } catch (err) {
                console.error(err.message);
            }
        } else if(selectedOption === 'Community') {
            const body = {
                "community_name": eventName,
                "topic_text": topicName,
                "description": description
            };
            try {
                // Reset form fields if needed
                setTopicName('');
                setDescription('');
                setSelectedCommunity('');
                setSelectedPostingOption('');

                const response = await fetch('http://localhost:5000/communities/', {
                    method: 'POST',
                    headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                });
            } catch (err) {
                console.error(err.message);
            }
        } else if (selectedOption === 'Event') {
            // TODO: Handle the form submission (e.g., send data to server, perform actions)
            if (selectedPostingOption === 'Followers') {
                const body = {
                    "description": description,
                    "img": null,
                    "topic_text": topicName,
                    "post_type": selectedOption === 'Thread' ? 'thread' : 'Event' ? 'event' : 'Community' ? 'community' : 'poll'
                };
                try {
                    // Reset form fields if needed
                    setTopicName('');
                    setDescription('');
                    setSelectedCommunity('');
                    setSelectedPostingOption('');

                    const response = await fetch('http://localhost:5000/posts/', {
                        method: 'POST',
                        headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                        body: JSON.stringify(body),
                    });
                    const parseRes = await response.json();
                    setPostId(parseRes);
                } catch (err) {
                    console.error(err.message);
                }
            } else {
                const body = {
                    "description": description,
                    "img": null,
                    "community_name": selectedCommunity,
                    "post_type": selectedOption === 'Thread' ? 'thread' : 'Event' ? 'event' : 'Community' ? 'community' : 'poll'
                };
                try {
                    // Reset form fields if needed
                    setTopicName('');
                    setDescription('');
                    setSelectedCommunity('');
                    setSelectedPostingOption('');
    
                    const response = await fetch('http://localhost:5000/posts/community', {
                        method: 'POST',
                        headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                        body: JSON.stringify(body),
                    });

                    const parseRes = await response.json();
                    setPostId(parseRes);
                } catch (err) {
                    console.error(err.message);
                }
            }
        } else if (selectedOption === 'Thread' && selectedPostingOption === 'Community') {
            const body = {
                "description": description,
                "img": null,
                "community_name": selectedCommunity,
                "post_type": selectedOption === 'Thread' ? 'thread' : 'Event' ? 'event' : 'Community' ? 'community' : 'poll'
            };
            try {
                // Reset form fields if needed
                setTopicName('');
                setDescription('');
                setSelectedCommunity('');
                setSelectedPostingOption('');

                const response = await fetch('http://localhost:5000/posts/community', {
                    method: 'POST',
                    headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                });
            } catch (err) {
                console.error(err.message);
            }
        } else if(selectedOption === 'Polls') {
            const body = {
                "description": description,
                "img": null,
                "topic_text": topicName,
                "post_type": "poll"
            };
            try {
                // Reset form fields if needed
                setTopicName('');
                setDescription('');
                setSelectedCommunity('');
                setSelectedPostingOption('');

                const response = await fetch('http://localhost:5000/posts/', {
                    method: 'POST',
                    headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                    body: JSON.stringify(body),
                });
                const parseRes = await response.json();
                setPostId(parseRes);
            } catch (err) {
                console.error(err.message);
            }
        }
    };

    return (
        <div className="createContainer">
            <div className="createHeader">
                <h1 className="createTitle">Create {selectedOption}</h1>
                <div className="createOptionsContainer">
                    <select
                        id="createOptions"
                        name="createOptions"
                        value={selectedOption}
                        onChange={handleOptionChange}
                    >
                        <option value="" disabled>
                            Choose what to create
                        </option>
                        {createOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedOption === 'Thread' && (
            <form onSubmit={handleSubmit} className="createForm">
                <label htmlFor="topicName">Select Topic:</label>
                <select
                    id="topicName"
                    name="topicName"
                    value={topicName}
                    onChange={handleTopicNameChange}
                >
                    <option value="" disabled>
                        Select a Topic
                    </option>
                    {allTopics.map((topic) => (
                        <option key={topic.topic_id} value={topic.text}>
                            {topic.text}
                        </option>
                    ))}
                </select>


                <label htmlFor="content" className="createContentLabel">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="6"
                    className='createContentInput'
                ></textarea>

                <div className="postingOptionsContainer">
                    <label className='postingHeader'>For:</label>
                    <label className="postingOption">
                        <input
                            type="radio"
                            name="postingOption"
                            value={postingOptions[0]}
                            checked={selectedPostingOption === postingOptions[0]}
                            onChange={handlePostingOptionChange}
                        />
                        {postingOptions[0]}
                    </label>
                    <label className="postingOption">
                        <input
                            type="radio"
                            name="postingOption"
                            value={postingOptions[1]}
                            checked={selectedPostingOption === postingOptions[1]}
                            onChange={handlePostingOptionChange}
                        />
                        {postingOptions[1]}
                    </label>
                </div>

                {selectedPostingOption === 'Community' && (
                    <>
                        <label htmlFor="community">Community:</label>
                        <select
                            id="community"
                            name="community"
                            value={selectedCommunity}
                            onChange={handleCommunityChange}
                        >
                            <option value="" disabled>
                                Choose a community
                            </option>
                            {followedCommunities && followedCommunities.map((community, index) => (
                                <option key={index} value={community.name}>
                                    {community}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <button type="submit">Submit</button>
            </form>
            )}

            {selectedOption === 'Event' && (
            <form onSubmit={handleSubmit} className="createForm">
                <label htmlFor="topicName">Select Topic:</label>
                <select
                    id="topicName"
                    name="topicName"
                    value={topicName}
                    onChange={handleTopicNameChange}
                >
                    <option value="" disabled>
                        Select a Topic
                    </option>
                    {allTopics.map((topic) => (
                        <option key={topic.topic_id} value={topic.text}>
                            {topic.text}
                        </option>
                    ))}
                </select>


                <label htmlFor="content"  className="createContentLabel">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="6"
                    className='createContentInput'
                ></textarea>

                <div className="postingOptionsContainer">
                    <label className='postingHeader'>For:</label>
                    <label className="postingOption">
                        <input
                            type="radio"
                            name="postingOption"
                            value={postingOptions[0]}
                            checked={selectedPostingOption === postingOptions[0]}
                            onChange={handlePostingOptionChange}
                        />
                        {postingOptions[0]}
                    </label>
                    <label className="postingOption">
                        <input
                            type="radio"
                            name="postingOption"
                            value={postingOptions[1]}
                            checked={selectedPostingOption === postingOptions[1]}
                            onChange={handlePostingOptionChange}
                        />
                        {postingOptions[1]}
                    </label>
                </div>

                {selectedPostingOption === 'Community' && (
                    <>
                        <label htmlFor="community">Community:</label>
                        <select
                            id="community"
                            name="community"
                            value={selectedCommunity}
                            onChange={handleCommunityChange}
                        >
                            <option value="" disabled>
                                Choose a community
                            </option>
                            {followedCommunities && followedCommunities.map((community, index) => (
                                <option key={index} value={community.community_name}>
                                    {community.community_name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <label htmlFor="eventName" className="eventNameLabel">Event Name:</label>
                <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={eventName}
                    onChange={handleEventNameChange}
                />

                <label htmlFor="scheduledTime" className="scheduledTimeLabel">Scheduled Time:</label>
                <input
                    type="datetime-local"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={scheduledTime}
                    onChange={handleScheduledTimeChange}
                    className='scheduledTimeInput'
                    min={currentTime}
                />

                <label htmlFor='country_name' className='onboardingLabel'>
                    Location:
                </label>
                <select
                    name='country_name'
                    onChange={handleCountryNameChange}
                    className='onboardingInput'
                    defaultValue='' // setting default value to empty string
                >
                    <option value='' disabled hidden>
                    Select Country
                    </option>
                    {allCountries.map((country, index) => (
                    <option key={index} value={country.country_name}>{country.country_name}</option>
                    ))}
                </select>

                {/* Dropdown for cities */}
                {country_name && (
                    <div>
                    <label htmlFor='city_name' className='onboardingLabel'>
                        City:
                    </label>
                    <select
                        name='city_name'
                        onChange={handleCityNameChange}
                        className='onboardingInput'
                        defaultValue='' 
                    >
                        <option value='' disabled hidden>
                        Select City
                        </option>
                        {allCities.map((city, index) => (
                        <option key={index} value={city.city_name}>{city.city_name}</option>
                        ))}
                    </select>
                    </div>
                )}

                <button type="submit">Submit</button>
            </form>
            )}

            {selectedOption === 'Community' && (
            <form onSubmit={handleSubmit} className="createForm">
                <label htmlFor="topicName">Select Topic:</label>
                <select
                    id="topicName"
                    name="topicName"
                    value={topicName}
                    onChange={handleTopicNameChange}
                >
                    <option value="" disabled>
                        Select a Topic
                    </option>
                    {allTopics.map((topic) => (
                        <option key={topic.topic_id} value={topic.text}>
                            {topic.text}
                        </option>
                    ))}
                </select>


                <label htmlFor="content" className="createContentLabel">Description:</label>
                <textarea
                    id="content"
                    name="content"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="6"
                    className='createContentInput'
                ></textarea>

                <label htmlFor="eventName" className="eventNameLabel">Community Name:</label>
                <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={eventName}
                    onChange={handleEventNameChange}
                />

                <button type="submit">Submit</button>
            </form>
            )}
            {selectedOption === 'Polls' && (
            <form onSubmit={handleSubmit} className="createForm">
                <label htmlFor="topicName">Select Topic:</label>
                <select
                    id="topicName"
                    name="topicName"
                    value={topicName}
                    onChange={handleTopicNameChange}
                >
                    <option value="" disabled>
                        Select a Topic
                    </option>
                    {allTopics.map((topic) => (
                        <option key={topic.topic_id} value={topic.text}>
                            {topic.text}
                        </option>
                    ))}
                </select>


                <label htmlFor="content" className="createContentLabel">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="6"
                    className='createContentInput'
                ></textarea>

                <div className="pollOptionsContainer">
                    <label htmlFor="pollOptions">Poll Options:</label>
                    {pollOptions.map((option, index) => (
                        <div key={index} className="onePollOption">
                            <input
                                type="text"
                                value={option}
                                disabled
                            />
                            <button type="button" onClick={() => handleRemoveOption(index)} className='pollOptionButton'>
                                Remove
                            </button>
                        </div>
                    ))}
                    {pollOptions.length < 4 && (
                        <div className="onePollOption">
                            <input
                                type="text"
                                value={newPollOption}
                                onChange={(event) => setNewPollOption(event.target.value)}
                                placeholder="Enter new option"
                            />
                            <button type="button" onClick={handleAddOption} className='pollOptionButton'>
                                Add
                            </button>
                        </div>
                    )}
                </div>
                <button type="submit">Submit</button>
            </form>
            )}
        </div>
    );
}