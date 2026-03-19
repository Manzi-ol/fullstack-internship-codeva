const API_URL = 'http://localhost:5000/api/products';

// State
let allProducts = [];
let currentView = 'grid';

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
const errorText = document.getElementById('error-text');
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');
const noProducts = document.getElementById('no-products');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const sortSelect = document.getElementById('sort-select');
const resultsCount = document.getElementById('results-count');
const totalCount = document.getElementById('total-count');
const instockCount = document.getElementById('instock-count');
const outstockCount = document.getElementById('outstock-count');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const toastContainer = document.getElementById('toast-container');

// Helper: format price as currency
function formatPrice(price) {
  return '$' + Number(price).toFixed(2);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show/hide loading state
function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
  productsGrid.hidden = isLoading;
  noProducts.hidden = true;
}

// Show error message
function showError(message) {
  errorText.textContent = message;
  errorMessage.hidden = false;
  successMessage.hidden = true;
  setTimeout(() => { errorMessage.hidden = true; }, 5000);
}

// Show success message
function showSuccess(message) {
  successText.textContent = message;
  successMessage.hidden = false;
  errorMessage.hidden = true;
  setTimeout(() => { successMessage.hidden = true; }, 3000);
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// Update stats in header
function updateStats(products) {
  totalCount.textContent = products.length;
  instockCount.textContent = products.filter(p => p.inStock).length;
  outstockCount.textContent = products.filter(p => !p.inStock).length;
}

// Filter & sort products
function getFilteredProducts() {
  const search = searchInput.value.toLowerCase().trim();
  const category = filterCategory.value;
  const sort = sortSelect.value;

  let filtered = [...allProducts];

  // Search
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.description && p.description.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
  }

  // Category filter
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  // Sort
  switch (sort) {
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
  }

  return filtered;
}

// Render filtered products
function applyFilters() {
  const filtered = getFilteredProducts();
  resultsCount.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  renderProducts(filtered);
}

// Fetch and display all products
async function fetchProducts() {
  setLoading(true);
  errorMessage.hidden = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');

    const result = await response.json();
    allProducts = result.data || result;
    updateStats(allProducts);
    applyFilters();
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
      <div class="card-top">
        <h3>${escapeHtml(product.name)}</h3>
        <div class="price">${formatPrice(product.price)}</div>
      </div>
      <span class="category">${escapeHtml(product.category || 'Uncategorized')}</span>
      <p class="description">${escapeHtml(product.description || 'No description available')}</p>
      <div class="card-footer">
        <span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
          <span class="stock-dot"></span>
          ${product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
        <div class="card-actions">
          <button class="btn-edit" onclick="editProduct('${product._id || product.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn-delete" onclick="deleteProduct('${product._id || product.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Handle form submission (create or update)
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name) {
    showError('Product name is required');
    nameInput.focus();
    return;
  }

  if (isNaN(price) || price < 0) {
    showError('Please enter a valid price');
    priceInput.focus();
    return;
  }

  const productData = {
    name,
    description: descriptionInput.value.trim(),
    price,
    category: categoryInput.value,
    inStock: inStockInput.checked
  };

  const editId = productIdInput.value;
  submitBtn.disabled = true;
  submitBtn.textContent = editId ? 'Updating...' : 'Adding...';

  try {
    let response;

    if (editId) {
      response = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
    } else {
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

    const action = editId ? 'updated' : 'created';
    showToast(`Product ${action} successfully!`, 'success');
    resetForm();
    fetchProducts();
  } catch (error) {
    showError(error.message || 'Could not save product.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = productIdInput.value
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Update Product'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Product';
  }
});

// Edit a product: populate form with product data
async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');

    const result = await response.json();
    const product = result.data || result;

    productIdInput.value = product._id || product.id;
    nameInput.value = product.name;
    descriptionInput.value = product.description || '';
    priceInput.value = product.price;
    categoryInput.value = product.category || '';
    inStockInput.checked = product.inStock;

    formTitle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Product';
    submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Update Product';
    cancelBtn.hidden = false;

    productForm.scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();
  } catch (error) {
    showError(error.message || 'Could not load product for editing.');
  }
}

// Delete a product with confirmation
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete product');

    showToast('Product deleted successfully!', 'success');
    fetchProducts();
  } catch (error) {
    showError(error.message || 'Could not delete product.');
  }
}

// Reset form to add mode
function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  formTitle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add New Product';
  submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Product';
  cancelBtn.hidden = true;
  inStockInput.checked = true;
}

// View toggle
gridViewBtn.addEventListener('click', () => {
  currentView = 'grid';
  productsGrid.classList.remove('list-view');
  gridViewBtn.classList.add('active');
  listViewBtn.classList.remove('active');
});

listViewBtn.addEventListener('click', () => {
  currentView = 'list';
  productsGrid.classList.add('list-view');
  listViewBtn.classList.add('active');
  gridViewBtn.classList.remove('active');
});

// Event listeners for search, filter, sort
searchInput.addEventListener('input', debounce(applyFilters, 300));
filterCategory.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);
cancelBtn.addEventListener('click', resetForm);

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Keyboard shortcut: Escape to reset form
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && productIdInput.value) {
    resetForm();
  }
});

// Load products on page load
fetchProducts();
