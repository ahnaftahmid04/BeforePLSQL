import { useState } from 'react';
import { allCommunities } from '../constants';
import '../styles/create.css';

export default function Create() {
    const createOptions = ['Thread', 'Event', 'Community'];
    const postingOptions = ['Followers', 'Community'];

    const [selectedOption, setSelectedOption] = useState('');
    const [topicName, setTopicName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPostingOption, setSelectedPostingOption] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState('');

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

    const handleSubmit = async(event) => {
        event.preventDefault();
        // TODO: Handle the form submission (e.g., send data to server, perform actions)
        try {
            console.log('Submit form:', { selectedOption, topicName, description, selectedPostingOption, selectedCommunity });
            // Reset form fields if needed
            setTopicName('');
            setDescription('');
            setSelectedCommunity('');
            setSelectedPostingOption('');

            const response = fetch('http://localhost:5000/posts/', {
                method: 'POST',
                headers: {token: localStorage.token, 'Content-Type': 'application/json'},
                body: JSON.stringify({description}),
            });
            window.location.href = '/';
        } catch (err) {
            console.error(err.message);
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
                <label htmlFor="topicName">Topic Name:</label>
                <input className="topicNameInput"
                    type="text"
                    id="topicName"
                    name="topicName"
                    value={topicName}
                    onChange={handleTopicNameChange}
                />

                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="6"
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
                            {allCommunities.map((community) => (
                                <option key={community.id} value={community.name}>
                                    {community.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <button type="submit">Submit</button>
            </form>
            )}
        </div>
    );
}