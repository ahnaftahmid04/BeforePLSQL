import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import Follow from './pages/Follow';
import { useState, useEffect } from 'react';
import Profile from './pages/Profile';

function App() {
  const user = {
    name: 'Monkey D. Luffy',
    userName: 'joyboy',
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  }

  async function isAuth() {
    try {
      const response = await fetch('http://localhost:5000/auth/verify', {
        method: 'GET',
        headers: { token: localStorage.token }
      });

      const parseRes = await response.json();

      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <Routes>
      <Route
        exact path="/onboarding"
        element={!isAuthenticated ? <Navigate to="/login" /> : <Onboarding setAuth={setAuth}/>}
      />
      <Route
        exact path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setAuth}/>}
      />
      <Route
        exact path="/register"
        element={isAuthenticated ? <Navigate to="/onboarding" /> : <Register setAuth={setAuth} />}
      />
      {/*
      <Route
        path="/*"
        element={isAuthenticated ? <Layout setAuth={setAuth} ><Home setAuth={setAuth} /></Layout> : <Navigate to="/login" />}
      />
      <Route
        exact path='/create'
        element={isAuthenticated ? <Layout setAuth={setAuth} ><Create /></Layout> : <Navigate to="/login" />}
      />
      <Route
        exact path='/follow'
        element={isAuthenticated ? <Layout setAuth={setAuth} ><Follow /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path='/profile/:userName'
        element={<Layout setAuth={setAuth} ><Profile /></Layout>}
      />
      */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout setAuth={setAuth}>
              <Routes>
                <Route index element={<Home setAuth={setAuth} />} />
                <Route path="/create" element={<Create />} />
                <Route path="/follow" element={<Follow />} />
                <Route path="/profile/:userName" element={<Profile />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;