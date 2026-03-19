import { Link } from 'react-router-dom';

const ProductCard = ({ product, onDelete, currentUser }) => {
  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.id === product.createdBy?._id ||
      currentUser.id === product.createdBy ||
      currentUser.role === 'admin');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3 className="product-name">{product.name}</h3>
        <span className={`stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <p className="product-description">{product.description}</p>

      <div className="product-details">
        <span className="product-price">{formatPrice(product.price)}</span>
        <span className="category-badge">{product.category}</span>
      </div>

      {isOwnerOrAdmin && (
        <div className="product-actions">
          <Link to={`/products/edit/${product._id}`} className="btn btn-edit">
            Edit
          </Link>
          <button
            onClick={() => onDelete(product._id)}
            className="btn btn-delete"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
