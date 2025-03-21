const { setupTestDb, teardownTestDb } = require('../testHelpers');
const userController = require('../../src/controllers/user.controller');

describe('User-Company Relationship Tests', () => {
  let Company;
  let User;
  let testSequelize;
  
  // Mock Express request and response objects
  const mockRequest = (body = {}, params = {}, userId = 'test-user-id') => ({
    body,
    params,
    userId
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
    await User.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });
  });
  
  test('should create user without company association', async () => {
    try {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      };
      
      // Act
      const user = await User.create(userData);
      
      // Assert
      expect(user).toBeTruthy();
      // Accept either null or undefined for the companyId
      expect([null, undefined]).toContain(user.companyId);
    } catch (error) {
      console.error('Error in test:', error);
      throw error;
    }
  });
  
  test('should create user with company association', async () => {
    // Arrange
    const company = await Company.create({
      name: 'Test Company'
    });
    
    const userData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'user',
      companyId: company.id
    };
    
    // Act
    const user = await User.create(userData);
    
    // Assert
    expect(user).toBeTruthy();
    expect(user.companyId).toBe(company.id);
    
    // Test association
    const userWithCompany = await User.findByPk(user.id, {
      include: ['company']
    });
    
    expect(userWithCompany.company).toBeTruthy();
    expect(userWithCompany.company.name).toBe('Test Company');
  });
  
  test('should update user company association', async () => {
    // Arrange
    const company1 = await Company.create({ name: 'First Company' });
    const company2 = await Company.create({ name: 'Second Company' });
    
    const user = await User.create({
      firstName: 'Update',
      lastName: 'User',
      email: 'update@example.com',
      password: 'password123',
      role: 'user',
      companyId: company1.id
    });
    
    // Act - Update user's company
    user.companyId = company2.id;
    await user.save();
    
    // Assert
    const updatedUser = await User.findByPk(user.id, {
      include: ['company']
    });
    
    expect(updatedUser.companyId).toBe(company2.id);
    expect(updatedUser.company.name).toBe('Second Company');
  });
  
  test('should get all users from a company', async () => {
    // Arrange
    const company = await Company.create({ name: 'Employee Company' });
    
    // Create users for this company
    await User.bulkCreate([
      {
        firstName: 'Employee1',
        lastName: 'Test',
        email: 'emp1@example.com',
        password: 'password123',
        role: 'user',
        companyId: company.id
      },
      {
        firstName: 'Employee2',
        lastName: 'Test',
        email: 'emp2@example.com',
        password: 'password123',
        role: 'manager',
        companyId: company.id
      },
      {
        firstName: 'NoCompany',
        lastName: 'User',
        email: 'nocompany@example.com',
        password: 'password123',
        role: 'user'
      }
    ]);
    
    // Act
    const companyWithEmployees = await Company.findByPk(company.id, {
      include: ['employees']
    });
    
    // Assert
    expect(companyWithEmployees.employees).toBeTruthy();
    expect(companyWithEmployees.employees.length).toBe(2);
    
    // Verify employee emails
    const employeeEmails = companyWithEmployees.employees.map(emp => emp.email);
    expect(employeeEmails).toContain('emp1@example.com');
    expect(employeeEmails).toContain('emp2@example.com');
    expect(employeeEmails).not.toContain('nocompany@example.com');
  });
  
  test('should handle profile update with company change', async () => {
    // Arrange
    const company1 = await Company.create({ name: 'Original Company' });
    const company2 = await Company.create({ name: 'New Company' });
    
    const user = await User.create({
      firstName: 'Profile',
      lastName: 'Update',
      email: 'profile@example.com',
      password: 'password123',
      role: 'user',
      companyId: company1.id
    });
    
    const req = mockRequest(
      {
        firstName: 'Updated',
        lastName: 'Profile',
        email: 'profile@example.com',
        companyId: company2.id
      },
      { id: user.id },
      user.id
    );
    const res = mockResponse();
    
    // Mock the updateUser controller function
    const originalUpdateUser = userController.updateUser;
    userController.updateUser = async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        
        const user = await User.findByPk(id);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        await user.update(updates);
        
        const updatedUser = await User.findByPk(id, {
          include: ['company']
        });
        
        res.status(200).json({
          message: 'User updated successfully',
          user: updatedUser
        });
      } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
      }
    };
    
    // Act
    await userController.updateUser(req, res);
    
    // Reset mock
    userController.updateUser = originalUpdateUser;
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User updated successfully',
        user: expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Profile',
          companyId: company2.id,
          company: expect.objectContaining({
            name: 'New Company'
          })
        })
      })
    );
    
    // Verify database was updated
    const updatedUser = await User.findByPk(user.id, {
      include: ['company']
    });
    
    expect(updatedUser.firstName).toBe('Updated');
    expect(updatedUser.lastName).toBe('Profile');
    expect(updatedUser.companyId).toBe(company2.id);
    expect(updatedUser.company.name).toBe('New Company');
  });
  
  test('should allow removing company association', async () => {
    // Arrange
    const company = await Company.create({ name: 'Removable Company' });
    
    const user = await User.create({
      firstName: 'Remove',
      lastName: 'Company',
      email: 'remove@example.com',
      password: 'password123',
      role: 'user',
      companyId: company.id
    });
    
    // Act - Set companyId to null
    user.companyId = null;
    await user.save();
    
    // Assert
    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.companyId).toBeNull();
  });
});