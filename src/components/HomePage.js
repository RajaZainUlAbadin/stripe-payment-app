// components/HomePage.jsx
import React from 'react';
import ProductGrid from './ProductGrid.js';
import Header from './Header';
import './HomePage.css';

const HomePage = () => {
  const products = [
    {
      title: "Avanço de tecnologia em sistemas",
      price: "4,500,000.00",
    },
    {
      title: "Curso Programação intermediário",
      price: "5,000,000.00",
    },
    {
      title: "Desenvolvimento completo",
      price: "1,000,000.00",
    },
    {
      title: "Engenharia de Sistema",
      price: "350,000,000.00",
    },
    {
      title: "Implantação Software avançado",
      price: "9,999,000.00",
    },
    {
      title: "Invoice Requisitada",
      price: "1,000.00",
    },
    {
      title: "Mentoria Dedicada",
      price: "10,000,000.00",
    },
    {
      title: "Montagem empresarial",
      price: "580,000,000.00",
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