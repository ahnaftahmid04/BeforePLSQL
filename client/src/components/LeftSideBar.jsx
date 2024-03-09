import '../styles/leftsidebar.css'
import { sidebarLinks } from '../constants'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function LeftSideBar({ setAuth }) {
    const location = useLocation();
    const [isSeen, setIsSeen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [username, setUsername] = useState('');

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        setAuth(false);
    }

    const handleSeenStatus = async (e) => {
        setIsSeen(true);
    }

    const getNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/notifications/unseen/', {
                method: 'GET',
                headers: {token: localStorage.token}
            });
            const parseResponse = await response.json();
            setNotifications(parseResponse);
            if(parseResponse.length > 0) {
                setIsSeen(false);
            } else {
                setIsSeen(true);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getNotifications();
    }, []);

    async function getName() {
        try {
          const response = await fetch('http://localhost:5000/users/thisUser', {
            method: 'GET',
            headers: { token: localStorage.token},
          });
    
            const parseRes = await response.json();
            setUsername(parseRes.username);
        } catch (err) {
          console.error(err.message);
        } 
    }
    
    useEffect(() => {
        getName();
    }, []);

    return (
        <div className="leftsidebar">
            <Link to='/' className='leftsidebarHeader'>
                <img src='../../assets/logo.svg' alt='logo' className='leftsidebarLogo' />
                <h3 className='leftHeaderTitle'>HallowNest</h3>
            </Link>
            <div className="leftsidebarWrapper">
                {sidebarLinks.map((link) => (
                    // show Dashboard only if user is admin
                    link.label === 'Dashboard' && username !== 'admin' ? null : 
                    <Link 
                        to={link.route} 
                        className={`leftsidebarLink ${location.pathname === link.route ? 'active' : ''}`}
                        key={link.label}
                        onClick={() => handleSeenStatus()}
                        >
                        <img src={link.imgURL} alt={link.label} className="leftsidebarIcon" />
                        {
                            link.label === 'Notifications' && notifications && !isSeen ?
                            <p className="unseenleftsidebarTitle">{link.label}</p>
                            :
                            <p className="leftsidebarTitle">{link.label}</p>
                        }
                    </Link>
                ))}
            </div>
            <Link className='leftsidebarFooter' onClick={e => handleLogout(e)}>
                <img src='../../assets/logout.svg' alt='exit' className='leftsidebarIcon' />
                <p className='leftsidebarTitle'>Logout</p>
            </Link>
        </div>
    )
}