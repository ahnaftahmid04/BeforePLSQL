import { useState, useEffect } from "react";
import "../styles/notification.css";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);

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

    const handleSeenStatus = async (e) => {
        try {
            const response = await fetch(`http://localhost:5000/notifications/`, {
                method: 'PUT',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setIsSeen(true);
        } catch (error) {
            console.error(error.message);
        }
    }

    const getNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/notifications', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setNotifications(parseResponse);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getNotifications();
        handleSeenStatus();
    }, []);

    const getEventNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/notifications/eventNotifications', {
                method: 'POST',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            getNotifications();
        } catch (error) {
            console.error(error.message);
        }
    }

    setTimeout(() => {
        getEventNotifications();
    }, 1000 * 60 * 10);

    return (
        <div className="notification">
            <div className="notification-header">
                <h1>Notifications</h1>
            </div>
            <div className="notification-body">
                {notifications && notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                        <h3>{notification.notification_text}</h3>
                        <p className="notification-time">{calculateTimeAgo(notification.created_at)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}