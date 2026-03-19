import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from '../components/ProductForm';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (formData) => {
    setError('');
    setSaving(true);
    try {
      await api.put(`/products/${id}`, formData);
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Edit Product</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {product ? (
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Update Product"
          />
        ) : (
          <p>Product not found.</p>
        )}
      </div>
    </div>
  );
};

export default EditProduct;
