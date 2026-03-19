import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from '../components/ProductForm';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/products', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Add New Product</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <ProductForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
};

export default AddProduct;
