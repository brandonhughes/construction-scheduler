const request = require('supertest');
const express = require('express');
const { setupTestDb, teardownTestDb, mockAuthMiddleware } = require('../testHelpers');
const companyRoutes = require('../../src/routes/company.routes');
const companyController = require('../../src/controllers/company.controller');

// Mock the auth middleware
jest.mock('../../src/middleware/auth.middleware', () => ({
  verifyToken: (req, res, next) => {
    req.userId = 'mock-user-id';
    next();
  },
  isAdmin: (req, res, next) => {
    req.userRole = 'admin';
    next();
  }
}));

describe('Company Routes Integration Tests', () => {
  let app;
  let Company;
  let User;
  
  // Setup express app and test database
  beforeAll(async () => {
    const setup = await setupTestDb();
    Company = setup.Company;
    User = setup.User;
    
    // Setup Express app with company routes
    app = express();
    app.use(express.json());
    app.use('/api/companies', companyRoutes);
  });
  
  // Clean up after tests
  afterAll(async () => {
    await teardownTestDb();
  });
  
  // Clean up between tests
  afterEach(async () => {
    await Company.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });
  
  describe('POST /api/companies', () => {
    test('should create a new company', async () => {
      // Arrange
      const newCompany = {
        name: 'Integration Test Company',
        address: '123 Integration Rd',
        phone: '555-TEST',
        contactName: 'Test Contact',
        contactEmail: 'contact@test.com'
      };
      
      // Act
      const response = await request(app)
        .post('/api/companies')
        .send(newCompany);
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Company created successfully');
      expect(response.body).toHaveProperty('company');
      expect(response.body.company).toHaveProperty('name', newCompany.name);
      expect(response.body.company).toHaveProperty('address', newCompany.address);
      expect(response.body.company).toHaveProperty('active', true);
    });
    
    test('should return 400 if company name is missing', async () => {
      // Arrange
      const invalidCompany = {
        address: '123 Invalid Rd',
        phone: '555-INVALID'
      };
      
      // Act
      const response = await request(app)
        .post('/api/companies')
        .send(invalidCompany);
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Company name is required');
    });
  });
  
  describe('GET /api/companies', () => {
    test('should return all companies', async () => {
      // Arrange - Create test companies
      await Company.bulkCreate([
        { name: 'Integration Company 1', active: true },
        { name: 'Integration Company 2', active: false },
        { name: 'Integration Company 3', active: true }
      ]);
      
      // Act
      const response = await request(app).get('/api/companies');
      
      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      const companyNames = response.body.map(c => c.name);
      expect(companyNames).toContain('Integration Company 1');
      expect(companyNames).toContain('Integration Company 2');
      expect(companyNames).toContain('Integration Company 3');
    });
  });
  
  describe('GET /api/companies/active', () => {
    test('should return only active companies', async () => {
      // Arrange - Create test companies
      await Company.bulkCreate([
        { name: 'Active Integration 1', active: true },
        { name: 'Inactive Integration', active: false },
        { name: 'Active Integration 2', active: true }
      ]);
      
      // Act
      const response = await request(app).get('/api/companies/active');
      
      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Verify all returned companies are active
      response.body.forEach(company => {
        expect(company.active).toBe(true);
      });
      
      const companyNames = response.body.map(c => c.name);
      expect(companyNames).toContain('Active Integration 1');
      expect(companyNames).toContain('Active Integration 2');
      expect(companyNames).not.toContain('Inactive Integration');
    });
  });
  
  describe('GET /api/companies/:id', () => {
    test('should return a company by ID', async () => {
      // Arrange - Create a test company
      const company = await Company.create({
        name: 'Get By ID Company',
        address: '123 Get St',
        phone: '555-GET',
        active: true
      });
      
      // Act
      const response = await request(app).get(`/api/companies/${company.id}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', company.id);
      expect(response.body).toHaveProperty('name', 'Get By ID Company');
      expect(response.body).toHaveProperty('address', '123 Get St');
      expect(response.body).toHaveProperty('phone', '555-GET');
      expect(response.body).toHaveProperty('active', true);
    });
    
    test('should return 404 for non-existent company ID', async () => {
      // Act
      const response = await request(app).get('/api/companies/non-existent-id');
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found');
    });
  });
  
  describe('PUT /api/companies/:id', () => {
    test('should update a company', async () => {
      // Arrange - Create a test company
      const company = await Company.create({
        name: 'Update Test Company',
        address: 'Old Address',
        phone: '555-OLD',
        active: true
      });
      
      const updateData = {
        name: 'Updated Test Company',
        address: 'New Address',
        phone: '555-NEW'
      };
      
      // Act
      const response = await request(app)
        .put(`/api/companies/${company.id}`)
        .send(updateData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Company updated successfully');
      expect(response.body).toHaveProperty('company');
      expect(response.body.company).toHaveProperty('name', updateData.name);
      expect(response.body.company).toHaveProperty('address', updateData.address);
      expect(response.body.company).toHaveProperty('phone', updateData.phone);
      
      // Verify database was updated
      const updatedCompany = await Company.findByPk(company.id);
      expect(updatedCompany.name).toBe(updateData.name);
    });
    
    test('should return 404 when updating non-existent company', async () => {
      // Act
      const response = await request(app)
        .put('/api/companies/non-existent-id')
        .send({ name: 'Updated Name' });
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Company not found');
    });
  });
  
  describe('DELETE /api/companies/:id', () => {
    test('should soft delete a company with no active users', async () => {
      // Arrange - Create a test company
      const company = await Company.create({
        name: 'Delete Test Company',
        active: true
      });
      
      // Act
      const response = await request(app).delete(`/api/companies/${company.id}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Company deleted successfully');
      
      // Verify company was soft deleted
      const deletedCompany = await Company.findByPk(company.id);
      expect(deletedCompany.active).toBe(false);
    });
    
    test('should not delete a company with active users', async () => {
      // Arrange - Create a test company with an active user
      const company = await Company.create({
        name: 'Company With Users',
        active: true
      });
      
      // Create a user associated with this company
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'integration@test.com',
        password: 'password123',
        role: 'user',
        active: true,
        companyId: company.id
      });
      
      // Act
      const response = await request(app).delete(`/api/companies/${company.id}`);
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cannot delete company with active users');
      
      // Verify company is still active
      const activeCompany = await Company.findByPk(company.id);
      expect(activeCompany.active).toBe(true);
    });
  });
});