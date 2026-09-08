import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { User } from '../src/modules/users/user.model.js';
import { School } from '../src/modules/schools/school.model.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../src/constants/roles.js';

const app = createApp();

describe('Multi-Tenant Isolation Enforcement', () => {
  let schoolA: any;
  let schoolB: any;
  let tokenA: string;
  let tokenB: string;
  let superAdminToken: string;

  beforeEach(async () => {
    // School A
    schoolA = await School.create({
      name: 'Alpha Academy',
      code: 'ALP-01',
      slug: 'alpha',
      email: 'admin@alpha.edu',
      phone: '1111111111',
      address: '1st Street',
      city: 'Delhi',
      state: 'Delhi',
    });

    // School B
    schoolB = await School.create({
      name: 'Beta Global',
      code: 'BET-02',
      slug: 'beta',
      email: 'admin@beta.edu',
      phone: '2222222222',
      address: '2nd Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
    });

    const hash = await bcrypt.hash('Secret123!', 10);

    // School A Admin
    const userA = await User.create({
      schoolId: schoolA._id,
      name: 'Admin Alpha',
      email: 'admin@alpha.edu',
      passwordHash: hash,
      role: ROLES.SCHOOL_ADMIN,
      permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
      status: 'ACTIVE',
    });

    // School B Admin
    const userB = await User.create({
      schoolId: schoolB._id,
      name: 'Admin Beta',
      email: 'admin@beta.edu',
      passwordHash: hash,
      role: ROLES.SCHOOL_ADMIN,
      permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
      status: 'ACTIVE',
    });

    // Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'super@erp.com',
      passwordHash: hash,
      role: ROLES.SUPER_ADMIN,
      permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
      status: 'ACTIVE',
    });

    // Login each to get access tokens
    const resA = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@alpha.edu',
      password: 'Secret123!',
    });
    tokenA = resA.body.data.tokens.accessToken;

    const resB = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@beta.edu',
      password: 'Secret123!',
    });
    tokenB = resB.body.data.tokens.accessToken;

    const resSuper = await request(app).post('/api/v1/auth/login').send({
      email: 'super@erp.com',
      password: 'Secret123!',
    });
    superAdminToken = resSuper.body.data.tokens.accessToken;
  });

  it('should only return School A details when School A requests current school', async () => {
    const res = await request(app)
      .get('/api/v1/schools/current')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(schoolA._id.toString());
    expect(res.body.data.name).toBe('Alpha Academy');
  });

  it('should block School A Admin from supplying School B ID via query/params (403 Forbidden)', async () => {
    // School A Admin attempts to query with schoolId of School B
    const res = await request(app)
      .get(`/api/v1/schools/current?schoolId=${schoolB._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('CROSS_TENANT_ACCESS_FORBIDDEN');
  });

  it('should block School A Admin from accessing global Super Admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/schools')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INSUFFICIENT_ROLE');
  });

  it('should allow Super Admin to access all schools list', async () => {
    const res = await request(app)
      .get('/api/v1/schools')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
