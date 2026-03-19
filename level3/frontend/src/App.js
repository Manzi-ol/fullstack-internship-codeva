import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import apolloClient from './services/apolloClient';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import GraphQLDemo from './pages/GraphQLDemo';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <SocketProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/products/new"
                  element={
                    <ProtectedRoute>
                      <AddProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EditProduct />
                    </ProtectedRoute>
                  }
                />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/graphql-demo" element={<GraphQLDemo />} />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
