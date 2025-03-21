import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import CompanyService from '../services/company.service';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the services
jest.mock('../services/user.service');
jest.mock('../services/company.service');

describe('Profile Component', () => {
  // Mock current user
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    role: 'user',
    companyId: 'company-1',
    company: { name: 'Current Company' },
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  // Mock companies array
  const mockCompanies = [
    { id: 'company-1', name: 'Current Company' },
    { id: 'company-2', name: 'Other Company' },
    { id: 'company-3', name: 'Third Company' }
  ];
  
  // Mock update profile function
  const mockUpdateProfile = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock auth context
    useAuth.mockReturnValue({
      currentUser: mockUser,
      updateProfile: mockUpdateProfile
    });
    
    // Mock CompanyService.getActiveCompanies
    CompanyService.getActiveCompanies.mockResolvedValue(mockCompanies);
    
    // Mock UserService.updateUser
    UserService.updateUser.mockResolvedValue({
      user: { ...mockUser, firstName: 'Updated', lastName: 'Name' }
    });
  });
  
  test('renders profile information correctly', async () => {
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Check if profile information is displayed
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-123-4567')).toBeInTheDocument();
    
    // Check company information section
    expect(screen.getByText(/Role:/)).toBeInTheDocument();
    expect(screen.getByText(/User/)).toBeInTheDocument();
    expect(screen.getByText(/Company:/)).toBeInTheDocument();
    expect(screen.getByText(/Current Company/)).toBeInTheDocument();
  });
  
  test('loads companies and displays them in dropdown', async () => {
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Check if company dropdown has the correct options
    const companySelect = screen.getByLabelText(/Company/i);
    expect(companySelect).toBeInTheDocument();
    
    // Check for all company options
    expect(screen.getByText('Current Company')).toBeInTheDocument();
    expect(screen.getByText('Other Company')).toBeInTheDocument();
    expect(screen.getByText('Third Company')).toBeInTheDocument();
    
    // Check if current company is selected
    expect(companySelect.value).toBe('company-1');
  });
  
  test('handles company change in dropdown', async () => {
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Find the company dropdown and change the selection
    const companySelect = screen.getByLabelText(/Company/i);
    fireEvent.change(companySelect, { target: { value: 'company-2' } });
    
    // Check if selection changed
    expect(companySelect.value).toBe('company-2');
  });
  
  test('updates profile with new company selection', async () => {
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Update form fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Name' } });
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'company-2' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Profile'));
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(UserService.updateUser).toHaveBeenCalledWith('user-123', expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
        companyId: 'company-2'
      }));
    });
    
    // Check if updateProfile was called with the updated user
    expect(mockUpdateProfile).toHaveBeenCalled();
    
    // Check for success message
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });
  
  test('handles error when companies fail to load', async () => {
    // Mock an error when loading companies
    CompanyService.getActiveCompanies.mockRejectedValue(new Error('Failed to load companies'));
    
    render(<Profile />);
    
    // Wait for companies to load (and fail)
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Check if the select shows the loading message
    const companySelect = screen.getByLabelText(/Company/i);
    expect(companySelect).toBeInTheDocument();
    
    // Should show "Loading companies..." as an option
    expect(screen.getByText('Loading companies...')).toBeInTheDocument();
  });
  
  test('handles error when updating profile', async () => {
    // Mock an error when updating user
    UserService.updateUser.mockRejectedValue({ message: 'Update failed' });
    
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Submit the form without changing anything
    fireEvent.click(screen.getByText('Update Profile'));
    
    // Wait for the update to fail
    await waitFor(() => {
      expect(UserService.updateUser).toHaveBeenCalled();
    });
    
    // Check for error message
    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });
  
  test('handles case where companies is undefined', async () => {
    // Mock undefined companies response
    CompanyService.getActiveCompanies.mockResolvedValue(undefined);
    
    render(<Profile />);
    
    // Wait for companies to load
    await waitFor(() => {
      expect(CompanyService.getActiveCompanies).toHaveBeenCalled();
    });
    
    // Should show "Loading companies..." as an option
    expect(screen.getByText('Loading companies...')).toBeInTheDocument();
  });
});