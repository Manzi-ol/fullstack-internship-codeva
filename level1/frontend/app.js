const API_URL = 'http://localhost:5000/api/products';

// DOM Elements
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const productIdInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const categoryInput = document.getElementById('category');
const inStockInput = document.getElementById('inStock');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const productsGrid = document.getElementById('products-grid');
const loadingEl = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const noProducts = document.getElementById('no-products');

// Helper: format price as currency
function formatPrice(price) {
  return '$' + Number(price).toFixed(2);
}

// Show/hide loading state
function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
  productsGrid.hidden = isLoading;
  noProducts.hidden = true;
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  setTimeout(() => {
    errorMessage.hidden = true;
  }, 5000);
}

// Fetch and display all products
async function fetchProducts() {
  setLoading(true);
  errorMessage.hidden = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    showError(error.message || 'Could not load products. Is the server running?');
    productsGrid.innerHTML = '';
    productsGrid.hidden = false;
  } finally {
    setLoading(false);
  }
}

// Render product cards
function renderProducts(products) {
  productsGrid.innerHTML = '';

  if (!products || products.length === 0) {
    noProducts.hidden = false;
    return;
  }

  noProducts.hidden = true;

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <h3>${escapeHtml(product.name)}</h3>
      <span class="category">${escapeHtml(product.category || 'Uncategorized')}</span>
      <p class="description">${escapeHtml(product.description || 'No description')}</p>
      <div class="price">${formatPrice(product.price)}</div>
      <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
        ${product.inStock ? 'In Stock' : 'Out of Stock'}
      </span>
      <div class="card-actions">
        <button class="btn-edit" onclick="editProduct('${product._id}')">Edit</button>
        <button class="btn-delete" onclick="deleteProduct('${product._id}')">Delete</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle form submission (create or update)
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    price: parseFloat(priceInput.value),
    category: categoryInput.value.trim(),
    inStock: inStockInput.checked
  };

  const editId = productIdInput.value;

  try {
    let response;

    if (editId) {
      // Update existing product
      response = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } else {
      // Create new product
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save product');
    }

    resetForm();
    fetchProducts();
  } catch (error) {
    showError(error.message || 'Could not save product.');
  }
});

// Edit a product: populate form with product data
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');

    const product = await response.json();

    productIdInput.value = product._id;
    nameInput.value = product.name;
    descriptionInput.value = product.description || '';
    priceInput.value = product.price;
    categoryInput.value = product.category || '';
    inStockInput.checked = product.inStock;

    formTitle.textContent = 'Edit Product';
    submitBtn.textContent = 'Update Product';
    cancelBtn.hidden = false;

    // Scroll form into view on mobile
    productForm.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showError(error.message || 'Could not load product for editing.');
  }
}

// Delete a product with confirmation
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete product');

    fetchProducts();
  } catch (error) {
    showError(error.message || 'Could not delete product.');
  }
}

// Reset form to add mode
function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  formTitle.textContent = 'Add New Product';
  submitBtn.textContent = 'Add Product';
  cancelBtn.hidden = true;
  inStockInput.checked = true;
}

// Cancel editing
cancelBtn.addEventListener('click', resetForm);

// Load products on page load
fetchProducts();
