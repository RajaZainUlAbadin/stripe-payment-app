// components/ProductGrid.jsx
import React from 'react';
import ProductCard from './ProductCard.js';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
  const handleProductClick = (title, price) => {
    console.log(`Selected product: ${title} - USD ${price}`);
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