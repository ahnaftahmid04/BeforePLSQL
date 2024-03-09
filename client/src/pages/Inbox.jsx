import { useState, useEffect } from "react";
import "../styles/inbox.css";

export default function Inbox() {

    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatters, setChatters] = useState([]);
    const [isClicked, setIsClicked] = useState(false);
    const [selectedChatter, setSelectedChatter] = useState(null);
    const [userId, setUserId] = useState('');
    const [sentMessage, setSentMessage] = useState('');

    const handleSearch = async(e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setIsClicked(true);
        try {
            const response = await fetch(`http://localhost:5000/users/find/${term}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setChatters(parseResponse);
        } catch (error) {
            console.error(error.message);                
        }
    };

    const handleInbox = async (e) => {
        setIsClicked(false);
        setSearchTerm('');
        try {
            const response = await fetch('http://localhost:5000/messages/users/1', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setChatters(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const formatDate = (created_at) => {
        const date = new Date(created_at);
        return date.toLocaleDateString('en-UK');
    };

    const calculateTimeAgo = (created_at) => {
        const currentTime = new Date();
        const postTime = new Date(created_at);
        const timeDifference = currentTime - postTime;

        const seconds = Math.floor(timeDifference / 1000);
        if (seconds < 60) {
            return (`${seconds}s`);
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return (`${minutes}m`);
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return (`${hours}h`);
        }

        return (formatDate(created_at));
    };

    const handleMessages = async (receiver_user_name) => {
        try {
            const response = await fetch(`http://localhost:5000/messages/${receiver_user_name}`, {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setMessages(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleSeenStatus = async (user_id) => {
        try {
            const response = await fetch(`http://localhost:5000/messages/${user_id}`, {
                method: 'PUT',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            handleInbox();
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleSendMessage = async (receiver_user_name) => {
        try {
            const body = { 
                "receiver_user_name": receiver_user_name,
                "content": sentMessage 
            };
            const response = await fetch(`http://localhost:5000/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', token: localStorage.token },
                body: JSON.stringify(body)
            });
            const parseResponse = await response.json();
            setSentMessage('');
            handleMessages(receiver_user_name);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        handleInbox();
    }, []);

    useEffect(() => {
        if (selectedChatter) {
            handleMessages(selectedChatter.username);
            handleSeenStatus(selectedChatter.id);
        }
    }, [selectedChatter]);

    async function getUserId() {
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

    // Function to scroll to the bottom of the chat messages
    function scrollToBottom() {
        const chatMessages = document.querySelector('.chat-message');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    useEffect(() => {
        getUserId();
    }, []);

    return (
        <div className="inbox">
            <div className="messages">
                <div className="inbox-header">
                    <h1>Inbox</h1>
                    <input type="text" placeholder="Search users" value={searchTerm} onChange={handleSearch} />
                    {isClicked &&
                        <button onClick={handleInbox} className="inboxBack">Back</button>
                    }
                </div>
                <div className="inbox-chatters">
                    {chatters && chatters.map((chatter) => (
                        <div key={chatter.id} className="inbox-chatter">    
                            <div className={chatter.last_message_seen_status || chatter.last_message_sender_id === userId ? "inbox-chatter-seen" : "inbox-chatter-unseen"}
                                onClick={() => {setSelectedChatter(chatter)}}>
                                <div className="chatterDescription">
                                    <h3>{chatter.name}</h3>
                                    {chatter.last_message_time &&
                                        <p className="lastMessageTime">{calculateTimeAgo(chatter.last_message_time)}</p>
                                    }
                                </div>
                                <p className="lastMessage">{chatter.last_message_content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat">
                <div className="chat-header">
                    <h1>{selectedChatter ? selectedChatter.name : "Chat"}</h1>
                </div>
                {selectedChatter ? (
                <div className="chat-messages">
                    <div className="chat-message" ref={scrollToBottom}>
                        {messages && messages.map((message) => (
                            <div key={message.message_id} className={message.sender_user_id === userId ? "sentMessage" : "receivedMessage"}>
                                <p>{message.content}</p>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input type="text" placeholder="Type a message" className="chatInputText" value={sentMessage} onChange={(e) => setSentMessage(e.target.value)} />
                        <button className="chatInputButton" onClick={() => handleSendMessage(selectedChatter.username)}>Send</button>
                    </div>
                </div>) : (
                    <div className="selectChat">
                        <pre>Select a user to chat with</pre>
                    </div>
                )}
            </div>
        </div>
    );
}