import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { User } from '../src/modules/users/user.model.js';
import { School } from '../src/modules/schools/school.model.js';
import { RefreshToken } from '../src/modules/auth/refreshToken.model.js';
import { ROLES } from '../src/constants/roles.js';

const app = createApp();

describe('Authentication & JWT Rotation API', () => {
  let testSchool: any;
  let testUser: any;

  beforeEach(async () => {
    testSchool = await School.create({
      name: 'Springfield Academy',
      code: 'SPA-01',
      slug: 'springfield',
      email: 'info@springfield.edu',
      phone: '1234567890',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
    });

    const hash = await bcrypt.hash('Password123!', 10);
    testUser = await User.create({
      schoolId: testSchool._id,
      name: 'Homer Simpson',
      email: 'homer@springfield.edu',
      passwordHash: hash,
      role: ROLES.SCHOOL_ADMIN,
      permissions: ['students.view'],
      status: 'ACTIVE',
    });
  });

  it('should authenticate user with valid credentials and return access + refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'homer@springfield.edu',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe('homer@springfield.edu');
    expect(res.body.data.school.name).toBe('Springfield Academy');

    // Confirm refresh token was saved in database
    const tokenRecord = await RefreshToken.findOne({ userId: testUser._id });
    expect(tokenRecord).toBeTruthy();
    expect(tokenRecord?.revoked).toBe(false);
  });

  it('should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'homer@springfield.edu',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('should rotate refresh token and issue new token pair', async () => {
    // 1. Initial Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'homer@springfield.edu',
        password: 'Password123!',
      });

    const initialRefreshToken = loginRes.body.data.tokens.refreshToken;

    // 2. Refresh token request
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: initialRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).toBeDefined();
    expect(refreshRes.body.data.refreshToken).not.toBe(initialRefreshToken);

    // 3. Re-using the old refresh token should be rejected (revocation check)
    const reusedRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: initialRefreshToken });

    expect(reusedRes.status).toBe(401);
  });

  it('should revoke refresh token on logout', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'homer@springfield.edu',
        password: 'Password123!',
      });

    const refreshToken = loginRes.body.data.tokens.refreshToken;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);

    // Verify token is revoked in DB
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    expect(tokenDoc?.revoked).toBe(true);
  });

  it('should retrieve authenticated user profile with GET /api/v1/auth/me', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'homer@springfield.edu',
        password: 'Password123!',
      });

    const accessToken = loginRes.body.data.tokens.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('homer@springfield.edu');
    expect(meRes.body.data.school.id).toBe(testSchool._id.toString());
  });
});
