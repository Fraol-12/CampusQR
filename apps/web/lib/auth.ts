import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { RoleSchema, type Role } from '@campusqr/types';

export type SessionUser = {
  id: number;
  email: string;
  role: Role;
  fullName: string;
  studentRefId?: number | null;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET || 'campus-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const role = RoleSchema.parse(payload.role);

    return {
      id: Number(payload.id),
      email: String(payload.email),
      role,
      fullName: String(payload.fullName),
      studentRefId: payload.studentRefId == null ? null : Number(payload.studentRefId),
    };
  } catch {
    return null;
  }
}

export async function getRequestUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  return token ? verifyJwtToken(token) : null;
}
