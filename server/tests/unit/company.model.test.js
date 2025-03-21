const { setupTestDb, teardownTestDb } = require('../testHelpers');

describe('Company Model Tests', () => {
  let Company;
  let testSequelize;
  
  // Setup before tests
  beforeAll(async () => {
    const setup = await setupTestDb();
    Company = setup.Company;
    testSequelize = setup.testSequelize;
  });
  
  // Clean up after tests
  afterAll(async () => {
    await teardownTestDb();
  });
  
  // Clean up between tests
  afterEach(async () => {
    await Company.destroy({ where: {}, force: true });
  });
  
  test('should create a company with valid data', async () => {
    // Arrange
    const companyData = {
      name: 'Test Construction Co.',
      address: '123 Test St',
      phone: '555-123-4567',
      contactName: 'John Test',
      contactEmail: 'john@test.com',
      active: true
    };
    
    // Act
    const company = await Company.create(companyData);
    
    // Assert
    expect(company).toBeTruthy();
    expect(company.id).toBeTruthy();
    expect(company.name).toBe(companyData.name);
    expect(company.address).toBe(companyData.address);
    expect(company.phone).toBe(companyData.phone);
    expect(company.contactName).toBe(companyData.contactName);
    expect(company.contactEmail).toBe(companyData.contactEmail);
    expect(company.active).toBe(true);
  });
  
  test('should not create a company without a name', async () => {
    // Arrange
    const companyData = {
      address: '123 Test St',
      phone: '555-123-4567',
      contactName: 'John Test',
      contactEmail: 'john@test.com'
    };
    
    // Act & Assert
    await expect(Company.create(companyData)).rejects.toThrow();
  });
  
  test('should validate email format', async () => {
    // Arrange
    const companyData = {
      name: 'Test Email Validation',
      contactEmail: 'invalid-email'
    };
    
    // Act & Assert
    await expect(Company.create(companyData)).rejects.toThrow();
  });
  
  test('should enforce unique company names', async () => {
    // Arrange
    const companyName = 'Unique Company Test';
    const firstCompany = {
      name: companyName,
      address: '123 First St'
    };
    
    const duplicateCompany = {
      name: companyName,
      address: '456 Second St'
    };
    
    // Act
    await Company.create(firstCompany);
    
    // Assert
    await expect(Company.create(duplicateCompany)).rejects.toThrow();
  });
  
  test('should update company properties', async () => {
    // Arrange
    const initialData = {
      name: 'Company To Update',
      address: 'Old Address',
      active: true
    };
    
    const company = await Company.create(initialData);
    
    // Act
    company.address = 'New Address';
    company.active = false;
    await company.save();
    
    // Assert
    const updatedCompany = await Company.findByPk(company.id);
    expect(updatedCompany.address).toBe('New Address');
    expect(updatedCompany.active).toBe(false);
  });
  
  test('should soft delete a company by setting active to false', async () => {
    // Arrange
    const companyData = {
      name: 'Company To Delete',
      active: true
    };
    
    const company = await Company.create(companyData);
    
    // Act
    await company.update({ active: false });
    
    // Assert
    const updatedCompany = await Company.findByPk(company.id);
    expect(updatedCompany.active).toBe(false);
  });
});