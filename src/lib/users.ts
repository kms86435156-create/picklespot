import "server-only";
import { readJSON, writeJSON } from "./db";
import { hashPassword, verifyPassword } from "./auth";

const FILE = "users.json";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = readJSON(FILE);
  return users.find((u: any) => u.email === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = readJSON(FILE);
  return users.find((u: any) => u.id === id) || null;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function createUser(email: string, password: string, name: string, phone: string): Promise<User> {
  // 중복 체크
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("이미 가입된 이메일입니다.");

  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    phone,
    role: "user",
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  const users = readJSON(FILE);
  users.push(user);
  writeJSON(FILE, users);
  return user;
}
