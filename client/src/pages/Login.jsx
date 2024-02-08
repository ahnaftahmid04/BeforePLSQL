import '../styles/login.css'
import { Link } from 'react-router-dom'
import { useState } from "react"

export default function Login({setAuth}) {
    const [inputs, setInputs] = useState({
        username: '',
        password: '',
    });

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const body = {...inputs};
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const parseRes = await response.json();

            localStorage.setItem("token", parseRes.token);

            setAuth(true);
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className='login'>
            <div className='loginWrapper'>
                <div className='loginLeft'>
                    <h1 className='loginLogo'>Hallow<br/>Nest.</h1>
                    <p className='loginDesc'>
                        Connect with friends and the world around you on Hallownest.
                    </p>
                    <span className='loginSpan'>Don't you have an account?</span>
                    <Link to='/register' className='link'>
                        <button className='loginRegisterButton'>Register</button>
                    </Link>
                </div>
                <div className='loginRight'>
                    <h1 className='loginHeader'>Login</h1>
                    <form className='loginBox' onSubmit={handleLogin}>
                        <input 
                            type='text' 
                            placeholder='Username' 
                            className='loginInput'
                            name='username' 
                            value={inputs.username} 
                            onChange={e => handleChange(e)}/>
                        <input 
                            type='password' 
                            placeholder='Password' 
                            className='loginInput' 
                            name='password'
                            value={inputs.password} 
                            onChange={e => handleChange(e)}/>
                        <button className='loginButton'>Login</button>
                    </form>
                </div>
            </div>
        </div>
    )
}