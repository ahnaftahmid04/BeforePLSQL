import { useState } from 'react';
import '../styles/onboarding.css';

export default function Onboarding() {
  const locations = ['Location 1', 'Location 2', 'Location 3'];

  const [inputs, setInputs] = useState({
    bio: '',
    location: '',
  });

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const body = { ...inputs };
      const response = await fetch('http://localhost:5000/users/', {
        method: 'PUT',
        headers: {token: localStorage.token, 'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      window.location.href = '/';
    } catch (err) {
      console.error(err.message);
    }
  };
  

  return (
    <div className='onboarding'>
      <div className='onboardingWrapper'>
        <h1 className='onboardingTitle'>Onboarding</h1>
        <p className='onboardingDesc'>
          Complete your profile to start using Hallownest.
        </p>
        <form className='onboardingBox' onSubmit={handleSubmit}>
          <label htmlFor='location' className='onboardingLabel'>
            Location:
          </label>
          <input
            type='text'
            name='location'
            onChange={handleChange}
            className='onboardingInput'
            placeholder='Location'
          >
          </input>

          <label htmlFor='bio' className='onboardingLabel'>
            Bio:
          </label>
          <input
            type='text'
            name='bio'
            onChange={handleChange}
            rows='4'
            className='onboardingInput'
          ></input>
          <button type='submit' className='onboardingButton'>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}