import { useState, useEffect } from 'react';
import '../styles/onboarding.css';

export default function Onboarding() {
  const locations = ['Location 1', 'Location 2', 'Location 3'];
  const [allCountries, setAllCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const [inputs, setInputs] = useState({
    bio: '',
    city_name: '',
    country_name: '',
  });

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
          const response = await fetch(`http://localhost:5000/locations/cities/${inputs.country_name}`, {
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
      if (inputs.country_name) {
          fetchAllCities();
      }
  }, [inputs.country_name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value,
      // If the name of the select is 'location', set 'country_name' to the selected value
      // If the name of the select is 'city', set 'city_name' to the selected value
      ...(name === 'location' && { country_name: value }),
      ...(name === 'city' && { city_name: value })
    }));
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
          {/*
          <input
            type='text'
            name='location'
            onChange={handleChange}
            className='onboardingInput'
            placeholder='Location'
          >
          </input>
          */}
          <label htmlFor='country_name' className='onboardingLabel'>
            Location:
          </label>
          <select
            name='country_name'
            onChange={handleChange}
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
          {inputs.country_name && (
            <div>
              <label htmlFor='city_name' className='onboardingLabel'>
                City:
              </label>
              <select
                name='city_name'
                onChange={handleChange}
                className='onboardingInput'
                defaultValue='' // setting default value to empty string
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