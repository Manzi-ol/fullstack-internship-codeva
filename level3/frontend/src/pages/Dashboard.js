import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get('/products', { params });
      const data = res.data;
      setProducts(data.products || data.data || data);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleProductCreated = (data) => {
      if (data.product) {
        setProducts((prev) => [data.product, ...prev]);
      }
    };

    const handleProductUpdated = (data) => {
      if (data.product) {
        setProducts((prev) =>
          prev.map((p) => (p._id === data.product._id ? data.product : p))
        );
      }
    };

    const handleProductDeleted = (data) => {
      const deletedId = data.productId || data.product?._id;
      if (deletedId) {
        setProducts((prev) => prev.filter((p) => p._id !== deletedId));
      }
    };

    socket.on('product_created', handleProductCreated);
    socket.on('product_updated', handleProductUpdated);
    socket.on('product_deleted', handleProductDeleted);

    return () => {
      socket.off('product_created', handleProductCreated);
      socket.off('product_updated', handleProductUpdated);
      socket.off('product_deleted', handleProductDeleted);
    };
  }, [socket]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Products</h1>
          <p className="dashboard-subtitle">
            Manage your product inventory
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        )}
      </div>

      <form className="filters-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="category-filter"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Home & Garden">Home & Garden</option>
          <option value="Sports">Sports</option>
          <option value="Toys">Toys</option>
          <option value="Food & Beverages">Food & Beverages</option>
          <option value="Health">Health</option>
          <option value="Automotive">Automotive</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>
            {search || category
              ? 'Try adjusting your search or filter.'
              : 'Get started by adding your first product.'}
          </p>
          {isAuthenticated && !search && !category && (
            <Link to="/products/new" className="btn btn-primary">
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
