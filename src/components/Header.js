// components/Header.jsx
import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="left-section">
        <div className="logo">
          <img src="https://www.clinkpagamentosvisanet.com/cdn/shop/files/visanet-logo.webp?v=1715982919&width=90" alt="VisaNet" />
        </div>
        <nav>
          <a href="/">Home</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;