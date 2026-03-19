const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    inStock: Boolean!
    createdBy: User
    createdAt: String
    updatedAt: String
  }

  type Notification {
    id: ID!
    message: String!
    type: String!
    relatedProduct: Product
    createdBy: User
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ProductConnection {
    products: [Product]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Query {
    products(page: Int, limit: Int, category: String, search: String, sort: String): ProductConnection
    product(id: ID!): Product
    me: User
    notifications: [Notification]
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createProduct(name: String!, description: String!, price: Float!, category: String!, inStock: Boolean): Product
    updateProduct(id: ID!, name: String, description: String, price: Float, category: String, inStock: Boolean): Product
    deleteProduct(id: ID!): Product
    markNotificationRead(id: ID!): Notification
  }
`;

module.exports = typeDefs;
