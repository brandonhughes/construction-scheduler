const { setupTestDb, teardownTestDb } = require('../testHelpers');
const companyController = require('../../src/controllers/company.controller');

describe('Company Controller Tests', () => {
  let Company;
  let User;
  let testSequelize;
  
  // Mock Express request and response objects
  const mockRequest = (body = {}, params = {}) => ({
    body,
    params
  });
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
  // Setup before tests
  beforeAll(async () => {
    const setup = await setupTestDb();
    Company = setup.Company;
    User = setup.User;
    testSequelize = setup.testSequelize;
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
  
  describe('create', () => {
    test('should create a company with valid data', async () => {
      // Arrange
      const req = mockRequest({
        name: 'New Test Company',
        address: '123 Test Avenue',
        phone: '555-987-6543',
        contactName: 'Jane Test',
        contactEmail: 'jane@test.com'
      });
      const res = mockResponse();
      
      // Act
      await companyController.create(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company created successfully',
          company: expect.objectContaining({
            name: 'New Test Company',
            address: '123 Test Avenue',
            active: true
          })
        })
      );
    });
    
    test('should return 400 when company name is missing', async () => {
      // Arrange
      const req = mockRequest({
        address: '123 Test Avenue',
        phone: '555-987-6543'
      });
      const res = mockResponse();
      
      // Act
      await companyController.create(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company name is required'
        })
      );
    });
  });
  
  describe('findAll', () => {
    test('should return all companies', async () => {
      // Arrange
      const companies = [
        { name: 'Company 1', active: true },
        { name: 'Company 2', active: false },
        { name: 'Company 3', active: true }
      ];
      
      // Create companies in the test database
      await Promise.all(companies.map(company => Company.create(company)));
      
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await companyController.findAll(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.length).toBeGreaterThanOrEqual(3);
      
      // Verify company names in the response
      const companyNames = responseData.map(company => company.name);
      expect(companyNames).toContain('Company 1');
      expect(companyNames).toContain('Company 2');
      expect(companyNames).toContain('Company 3');
    });
  });
  
  describe('findActive', () => {
    test('should return only active companies', async () => {
      // Arrange
      const companies = [
        { name: 'Active Company 1', active: true },
        { name: 'Inactive Company', active: false },
        { name: 'Active Company 2', active: true }
      ];
      
      // Create companies in the test database
      await Promise.all(companies.map(company => Company.create(company)));
      
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await companyController.findActive(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      
      // Only active companies should be returned
      expect(responseData.length).toBe(2);
      
      // Verify all returned companies are active
      responseData.forEach(company => {
        expect(company.active).toBe(true);
      });
      
      // Verify names of active companies
      const companyNames = responseData.map(company => company.name);
      expect(companyNames).toContain('Active Company 1');
      expect(companyNames).toContain('Active Company 2');
      expect(companyNames).not.toContain('Inactive Company');
    });
  });
  
  describe('findOne', () => {
    test('should return a company by ID', async () => {
      // Arrange
      const company = await Company.create({
        name: 'Find One Test Company',
        address: '123 Find St',
        active: true
      });
      
      const req = mockRequest({}, { id: company.id });
      const res = mockResponse();
      
      // Act
      await companyController.findOne(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Find One Test Company',
          address: '123 Find St',
        })
      );
    });
    
    test('should return 404 for non-existent company ID', async () => {
      // Arrange
      const req = mockRequest({}, { id: 'non-existent-id' });
      const res = mockResponse();
      
      // Act
      await companyController.findOne(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company not found'
        })
      );
    });
  });
  
  describe('update', () => {
    test('should update a company with valid data', async () => {
      // Arrange
      const company = await Company.create({
        name: 'Company To Update',
        address: 'Old Address',
        phone: '555-OLD',
        active: true
      });
      
      const req = mockRequest(
        {
          name: 'Updated Company Name',
          address: 'New Address',
          phone: '555-NEW'
        },
        { id: company.id }
      );
      const res = mockResponse();
      
      // Act
      await companyController.update(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company updated successfully',
          company: expect.objectContaining({
            name: 'Updated Company Name',
            address: 'New Address',
            phone: '555-NEW'
          })
        })
      );
      
      // Verify database was updated
      const updatedCompany = await Company.findByPk(company.id);
      expect(updatedCompany.name).toBe('Updated Company Name');
      expect(updatedCompany.address).toBe('New Address');
      expect(updatedCompany.phone).toBe('555-NEW');
    });
    
    test('should return 404 when updating non-existent company', async () => {
      // Arrange
      const req = mockRequest(
        { name: 'Updated Name' },
        { id: 'non-existent-id' }
      );
      const res = mockResponse();
      
      // Act
      await companyController.update(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company not found'
        })
      );
    });
  });
  
  describe('delete', () => {
    test('should soft delete a company with no active users', async () => {
      // Arrange
      const company = await Company.create({
        name: 'Company To Delete',
        active: true
      });
      
      const req = mockRequest({}, { id: company.id });
      const res = mockResponse();
      
      // Act
      await companyController.delete(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Company deleted successfully'
        })
      );
      
      // Verify company was soft deleted (active = false)
      const deletedCompany = await Company.findByPk(company.id);
      expect(deletedCompany.active).toBe(false);
    });
    
    test('should not delete a company with active users', async () => {
      // Arrange
      const company = await Company.create({
        name: 'Company With Users',
        active: true
      });
      
      // Create an active user for this company
      await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        active: true,
        companyId: company.id
      });
      
      const req = mockRequest({}, { id: company.id });
      const res = mockResponse();
      
      // Act
      await companyController.delete(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot delete company with active users'
        })
      );
      
      // Verify company is still active
      const activeCompany = await Company.findByPk(company.id);
      expect(activeCompany.active).toBe(true);
    });
  });
});