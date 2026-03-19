import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        setProduct(res.data.data || res.data);
      } catch (err) {
        setError('Failed to load product. It may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (productData) => {
    setError('');
    setSaving(true);

    try {
      await api.put(`/products/${id}`, productData);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to update product. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product && !loading) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="alert alert-error">Product not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Edit Product</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
          buttonText="Update Product"
        />
      </div>
    </div>
  );
};

export default EditProduct;
