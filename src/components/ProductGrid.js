// components/ProductGrid.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import ProductCard from './ProductCard.js';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
const navigate = useNavigate(); // Initialize useNavigate hook
  const handleProductClick = (title, price) => {
    navigate('/payment', { state: { productTitle: title, amount: price } });
  };

  return (
    <div className="products-grid">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          title={product.title}
          price={product.price}
          onClick={() => handleProductClick(product.title, product.price)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;