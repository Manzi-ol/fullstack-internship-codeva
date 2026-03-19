import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onDelete }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product._id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/edit/${product._id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-card-header">
          {product.category && (
            <span className="category-badge">{product.category}</span>
          )}
          <span
            className={`stock-indicator ${
              product.quantity > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="product-card-body">
          <h3 className="product-name">{product.name}</h3>
          {product.description && (
            <p className="product-description">
              {product.description.length > 80
                ? `${product.description.substring(0, 80)}...`
                : product.description}
            </p>
          )}
          <div className="product-meta">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="product-quantity">
              Qty: {product.quantity ?? 0}
            </span>
          </div>
        </div>
      </Link>

      {isAuthenticated && (
        <div className="product-card-actions">
          <button onClick={handleEdit} className="btn btn-sm btn-outline">
            Edit
          </button>
          <button onClick={handleDelete} className="btn btn-sm btn-danger">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
