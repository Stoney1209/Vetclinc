jest.setTimeout(10000);

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/vetclinic_test';
});

afterAll(() => {
  jest.clearAllMocks();
});
