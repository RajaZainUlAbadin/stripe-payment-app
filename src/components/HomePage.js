// components/HomePage.jsx
import React from 'react';
import ProductGrid from './ProductGrid.js';
import Header from './Header';
import './HomePage.css';

const HomePage = () => {
  const products = [
    {
      title: "Technology advancement in systems",
      price: "4,500.00",
    },
    {
      title: "Intermediate Programming Course",
      price: "5,000.00",
    },
    {
      title: "Full Development",
      price: "100,000.00",
    },
    {
      title: "Systems Engineering",
      price: "350,000.00",
    },
    {
      title: "Advanced Software Deployment",
      price: "99,999.00",
    },
    {
      title: "Requested Invoice",
      price: "1,000.00",
    },
    {
      title: "Dedicated Mentoring",
      price: "10,000.00",
    },
    {
      title: "Business Setup",
      price: "58,000.00",
    },
  ];

  return (
    <div className="home-page">
      <Header />
      <ProductGrid products={products} />
    </div>
  );
};

export default HomePage;