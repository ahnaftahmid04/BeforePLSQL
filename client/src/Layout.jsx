import './Layout.css';
import LeftSideBar from './components/LeftSideBar';
import RightSideBar from './components/RightSideBar';
import MainBar from './components/MainBar';
import { useState, useEffect } from 'react';

const Layout = ({ setAuth, children }) => {

  return (
    <div className="Layout">
      <LeftSideBar className="LeftSideBar" setAuth={setAuth} />
      <MainBar className="MainBar">{children}</MainBar>
      <RightSideBar className="RightSideBar"/>
    </div>
  );
};

export default Layout;