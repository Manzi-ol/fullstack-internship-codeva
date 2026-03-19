import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  if (loading) return <LoadingSpinner text="Loading product..." />;

  if (error || !product) {
    return (
      <div className="detail-page">
        <div className="alert alert-error">{error || 'Product not found'}</div>
        <Link to="/" className="btn btn-outline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        &larr; Back to Products
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <h1>{product.name}</h1>
          {product.category && (
            <span className="category-badge category-badge-lg">
              {product.category}
            </span>
          )}
        </div>

        <div className="detail-body">
          <div className="detail-info">
            <div className="detail-row">
              <span className="detail-label">Price</span>
              <span className="detail-value price-value">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{product.quantity ?? 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span
                className={`stock-indicator ${
                  product.quantity > 0 ? 'in-stock' : 'out-of-stock'
                }`}
              >
                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            {product.createdAt && (
              <div className="detail-row">
                <span className="detail-label">Added</span>
                <span className="detail-value">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {product.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="detail-actions">
            <Link to={`/products/edit/${product._id}`} className="btn btn-primary">
              Edit Product
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
