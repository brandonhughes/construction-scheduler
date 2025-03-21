# Testing Guide for Construction Scheduler

This document provides instructions for running tests in the Construction Scheduler application.

## Backend Tests

The backend tests are located in the `server/tests` directory and are organized into:
- Unit tests: Test individual functions and components in isolation
- Integration tests: Test the interaction between multiple components

### Running Backend Tests

From the `server` directory, run:

```bash
# Run all tests
npm test

# Run tests with watch mode (re-run tests on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Organization

- `tests/unit`: Contains unit tests for models, controllers, and services
- `tests/integration`: Contains integration tests for API endpoints
- `tests/testHelpers.js`: Contains helper functions and setup for tests

## Frontend Tests

The frontend tests are located in the `client/src` directory, alongside the components they test.

### Running Frontend Tests

From the `client` directory, run:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Key Test Files

- `src/pages/Profile.test.js`: Tests for user profile updates and company selection
- Additional component tests can be added to test other UI features

## Test Coverage

The test coverage report shows how much of the code is covered by tests. Coverage reports are generated in the `coverage` directory when running the coverage commands.

## Adding New Tests

When adding new features, follow these guidelines to create tests:

1. Create unit tests for new models, controllers, and services
2. Create integration tests for new API endpoints
3. Create frontend tests for new components and UI features
4. Ensure tests cover both success and error scenarios
5. Test edge cases and boundary conditions

## Testing Authentication and Authorization

The tests use mock authentication middleware to simulate authenticated users with different roles:

- `mockAuthMiddleware.verifyToken`: Simulates an authenticated user
- `mockAuthMiddleware.isAdmin`: Simulates an admin user

Use these helpers when testing protected endpoints.

## Database Testing

The tests use an in-memory SQLite database to avoid affecting the production database. The test database is created and destroyed for each test run, ensuring test isolation.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Supertest](https://github.com/visionmedia/supertest) for API endpoint testing