import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { User } from '../src/modules/users/user.model.js';
import { School } from '../src/modules/schools/school.model.js';
import { ROLES } from '../src/constants/roles.js';

const app = createApp();

describe('RBAC & Permission Middleware', () => {
  let studentToken: string;
  let teacherToken: string;

  beforeEach(async () => {
    const school = await School.create({
      name: 'Oakridge High',
      code: 'OAK-1',
      slug: 'oakridge',
      email: 'admin@oakridge.edu',
      phone: '123',
      address: 'Oak St',
      city: 'Oak',
      state: 'State',
    });

    const hash = await bcrypt.hash('OakPass1!', 10);

    const student = await User.create({
      schoolId: school._id,
      name: 'Student Tim',
      email: 'tim@oakridge.edu',
      passwordHash: hash,
      role: ROLES.STUDENT,
      permissions: ['attendance.view'],
      status: 'ACTIVE',
    });

    const teacher = await User.create({
      schoolId: school._id,
      name: 'Teacher Amy',
      email: 'amy@oakridge.edu',
      passwordHash: hash,
      role: ROLES.TEACHER,
      permissions: ['attendance.view', 'attendance.mark'],
      status: 'ACTIVE',
    });

    const res1 = await request(app).post('/api/v1/auth/login').send({
      email: 'tim@oakridge.edu',
      password: 'OakPass1!',
    });
    studentToken = res1.body.data.tokens.accessToken;

    const res2 = await request(app).post('/api/v1/auth/login').send({
      email: 'amy@oakridge.edu',
      password: 'OakPass1!',
    });
    teacherToken = res2.body.data.tokens.accessToken;
  });

  it('should reject unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/v1/schools/current');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_MISSING');
  });

  it('should allow authenticated users to fetch their own profile with GET /api/v1/auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe(ROLES.STUDENT);
  });
});
