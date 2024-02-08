import '../styles/register.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Register({setAuth}) {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
  });
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmitForm = async(e) => {
    e.preventDefault();
    try {
      const body = { ...inputs };
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();

      localStorage.setItem('token', parseRes.token);
      setAuth(true);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className='register'>
      <div className='registerWrapper'>
        <div className='registerLeft'>
          <h1 className='registerLogo'>Hallow<br/>Nest.</h1>
          <p className='registerDesc'>
            Connect with friends and the world around you on Hallownest.
          </p>
          <span className='registerSpan'>Don't you have an account?</span>
          <Link to='/login' className='link'>
            <button className='registerButton'>Login</button>
          </Link>
        </div>
        <div className='registerRight'>
          <h1 className='registerHeader'>Register</h1>
          <form className='registerBox' onSubmit={onSubmitForm}>
            <input
              type='text'
              placeholder='Username'
              className='registerInput'
              name='username'
              value={inputs.username}
              onChange={e => handleChange(e)}
            />
            <input
              type='email'
              placeholder='Email'
              className='registerInput'
              name='email'
              value={inputs.email}
              onChange={e => handleChange(e)}
            />
            <input
              type='password'
              placeholder='Password'
              className='registerInput'
              name='password'
              value={inputs.password}
              onChange={e => handleChange(e)}
            />
            <input
              type='text'
              placeholder='Name'
              className='registerInput'
              name='name'
              value={inputs.name}
              onChange={e => handleChange(e)}
            />
            <button
              className='registerLoginButton'
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
