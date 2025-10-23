// backend/tests/api_endpoints.test.js
const request = require('supertest');
const app = require('../server'); // Assuming your main Express app is exported from server.js
// const { signToken } = require('../utils/authUtils'); // Utility to generate JWTs for testing

describe('API Endpoints Integration Tests', () => {
    // Mock user tokens for testing permissions
    const issmToken = 'MOCK_ISSM_JWT'; // In a real test, you generate this with jwt.sign
    const soToken = 'MOCK_SO_JWT'; 
    const aoToken = 'MOCK_AO_JWT'; 
    const invalidToken = 'INVALID_TOKEN';

    // --- Helper function for authorized requests ---
    const getAuthHeader = (token) => ({ 'Authorization': `Bearer ${token}` });

    // --- Test: Public /health Endpoint ---
    test('GET /api/health should return 200 OK', async () => {
        const response = await request(app).get('/api/health');
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('OK');
    });
    
    // --- Test: /controls Endpoint Permissions ---
    describe('GET /api/controls', () => {
        test('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/controls');
            expect(response.statusCode).toBe(401); 
        });

        test('should return 200 for ISSM (view_all permission)', async () => {
            const response = await request(app)
                .get('/api/controls')
                .set(getAuthHeader(issmToken));
            expect(response.statusCode).toBe(200); 
        });

        test('should return 403 for System Owner (lacks edit_controls permission for update)', async () => {
            const response = await request(app)
                .post('/api/controls/AC-2/update')
                .set(getAuthHeader(soToken))
                .send({ status: 'Implemented' });
            expect(response.statusCode).toBe(403); 
        });
    });

    // --- Test: /poams Endpoint (Generation) ---
    describe('POST /api/poams/generate', () => {
        test('should return 200 for ISSM', async () => {
            const response = await request(app)
                .post('/api/poams/generate')
                .set(getAuthHeader(issmToken));
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('count');
        });

        test('should return 403 for Authorization Official (lacks edit_controls)', async () => {
            const response = await request(app)
                .post('/api/poams/generate')
                .set(getAuthHeader(aoToken));
            expect(response.statusCode).toBe(403);
        });
    });
});