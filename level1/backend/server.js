const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Routes ---------------

// Root route - API info
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Product Management API",
    version: "1.0.0",
    endpoints: {
      "GET    /api/products": "Get all products",
      "GET    /api/products/:id": "Get a single product",
      "POST   /api/products": "Create a new product",
      "PUT    /api/products/:id": "Update a product",
      "DELETE /api/products/:id": "Delete a product",
    },
  });
});

// Product routes
app.use("/api/products", productRoutes);

// --------------- Error Handling ---------------

// 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
