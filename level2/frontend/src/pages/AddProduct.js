import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductForm from '../components/ProductForm';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (productData) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/products', productData);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create product. Please try again.';
      setError(message);
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
          buttonText="Create Product"
        />
      </div>
    </div>
  );
};

export default AddProduct;
