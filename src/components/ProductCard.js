// components/ProductCard.jsx
import React from 'react';
import IntegrationWheel from './IntegrationWheel.js';
import './ProductCard.css';

const ProductCard = ({ title, price, onClick }) => {
    return (
        <div className="product-card" onClick={onClick}>
          <div className="wheel-container">
            <IntegrationWheel />
          </div>
          <div className="product-info">
            <h3 className="product-title">{title}</h3>
            <p className="product-price">${price} USD</p>
          </div>
        </div>
      );
};

export default ProductCard;