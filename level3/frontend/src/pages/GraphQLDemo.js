import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $offset: Int) {
    products(limit: $limit, offset: $offset) {
      _id
      name
      price
      category
      quantity
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      _id
      name
      description
      price
      category
      quantity
      createdAt
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      _id
      name
      description
      price
      category
      quantity
    }
  }
`;

const GraphQLDemo = () => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Electronics',
  });
  const [mutationResult, setMutationResult] = useState(null);

  // Query: Fetch product list
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(GET_PRODUCTS, { variables: { limit: 10, offset: 0 } });

  // Query: Fetch single product (when selected)
  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(GET_PRODUCT, {
    variables: { id: selectedProductId },
    skip: !selectedProductId,
  });

  // Mutation: Create product
  const [createProduct, { loading: createLoading }] = useMutation(CREATE_PRODUCT, {
    onCompleted: (data) => {
      setMutationResult(data.createProduct);
      setFormData({ name: '', description: '', price: '', quantity: '', category: 'Electronics' });
      refetchProducts();
    },
    onError: (err) => {
      console.error('Mutation error:', err);
    },
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    createProduct({
      variables: {
        input: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10),
          category: formData.category,
        },
      },
    });
  };

  const queryText = `query GetProducts($limit: Int, $offset: Int) {
  products(limit: $limit, offset: $offset) {
    _id
    name
    price
    category
    quantity
  }
}`;

  const singleQueryText = `query GetProduct($id: ID!) {
  product(id: $id) {
    _id
    name
    description
    price
    category
    quantity
    createdAt
  }
}`;

  const mutationText = `mutation CreateProduct($input: ProductInput!) {
  createProduct(input: $input) {
    _id
    name
    description
    price
    category
    quantity
  }
}`;

  return (
    <div className="graphql-demo">
      <div className="graphql-header">
        <h1>GraphQL Demo</h1>
        <p className="graphql-subtitle">
          Explore how GraphQL queries and mutations work compared to REST APIs.
          With GraphQL, you select exactly the fields you need.
        </p>
      </div>

      <div className="graphql-grid">
        {/* Query Section - Product List */}
        <div className="graphql-section">
          <h2>Query: Fetch Products</h2>
          <p className="section-desc">
            This query fetches only the fields we need: name, price, category, and quantity.
            Unlike REST, no extra data is transferred.
          </p>

          <div className="code-block">
            <div className="code-header">GraphQL Query</div>
            <pre><code>{queryText}</code></pre>
          </div>

          <div className="result-block">
            <div className="code-header">Result</div>
            {productsLoading ? (
              <p className="loading-text">Loading...</p>
            ) : productsError ? (
              <p className="error-text">Error: {productsError.message}</p>
            ) : (
              <div className="graphql-product-list">
                {(productsData?.products || []).map((product) => (
                  <div
                    key={product._id}
                    className={`graphql-product-item ${
                      selectedProductId === product._id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedProductId(product._id)}
                  >
                    <span className="gql-product-name">{product.name}</span>
                    <span className="gql-product-price">
                      ${product.price?.toFixed(2)}
                    </span>
                    <span className="gql-product-category">
                      {product.category || 'N/A'}
                    </span>
                    <span className="gql-product-qty">
                      Qty: {product.quantity}
                    </span>
                  </div>
                ))}
                {(!productsData?.products || productsData.products.length === 0) && (
                  <p className="empty-text">No products found. Create one below!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Query Section - Single Product Detail */}
        <div className="graphql-section">
          <h2>Query: Product Detail</h2>
          <p className="section-desc">
            Click a product from the list to fetch its full details, including
            description and createdAt - fields not available in the list query.
          </p>

          <div className="code-block">
            <div className="code-header">GraphQL Query</div>
            <pre><code>{singleQueryText}</code></pre>
          </div>

          <div className="result-block">
            <div className="code-header">Result</div>
            {!selectedProductId ? (
              <p className="empty-text">Select a product from the list to see its details.</p>
            ) : productLoading ? (
              <p className="loading-text">Loading...</p>
            ) : productError ? (
              <p className="error-text">Error: {productError.message}</p>
            ) : productData?.product ? (
              <pre className="result-json">
                <code>{JSON.stringify(productData.product, null, 2)}</code>
              </pre>
            ) : (
              <p className="empty-text">Product not found.</p>
            )}
          </div>
        </div>

        {/* Mutation Section */}
        <div className="graphql-section graphql-section-full">
          <h2>Mutation: Create Product</h2>
          <p className="section-desc">
            Use a GraphQL mutation to create a new product. The mutation returns
            only the fields we specify, confirming what was created.
          </p>

          <div className="graphql-mutation-layout">
            <div>
              <div className="code-block">
                <div className="code-header">GraphQL Mutation</div>
                <pre><code>{mutationText}</code></pre>
              </div>

              {mutationResult && (
                <div className="result-block">
                  <div className="code-header">Mutation Result</div>
                  <pre className="result-json">
                    <code>{JSON.stringify(mutationResult, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>

            <div>
              <form className="graphql-form" onSubmit={handleCreateProduct}>
                <h3>Create Product via Mutation</h3>
                <div className="form-group">
                  <label htmlFor="gql-name">Name</label>
                  <input
                    type="text"
                    id="gql-name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Product name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gql-description">Description</label>
                  <input
                    type="text"
                    id="gql-description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Description"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gql-price">Price</label>
                    <input
                      type="number"
                      id="gql-price"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gql-quantity">Quantity</label>
                    <input
                      type="number"
                      id="gql-quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleFormChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="gql-category">Category</label>
                  <select
                    id="gql-category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Run Mutation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLDemo;
