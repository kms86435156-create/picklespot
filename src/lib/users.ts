import "server-only";
import { readJSON, writeJSON } from "./db";
import { hashPassword, verifyPassword } from "./auth";
import { supabaseAdmin, isSupabaseEnabled } from "./supabase";

const FILE = "users.json";
const TABLE = "users";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string; // "user" | "organizer"
  clubName: string;
  region: string;
  organizerNote: string;
  skillLevel: string; // "입문" | "초급" | "중급" | "상급" | ""
  preferredTimes: string; // JSON array or comma-separated
  playStyle: string; // "복식" | "단식" | "둘다" | ""
  onboardingCompleted: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

function toSnake(obj: any): any {
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k.replace(/[A-Z]/g, m => "_" + m.toLowerCase())] = v;
  }
  return result;
}

function toCamel(obj: any): any {
  if (!obj) return obj;
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return result;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { data } = await supabaseAdmin.from(TABLE).select("*").eq("email", email.toLowerCase()).single();
    return data ? toCamel(data) : null;
  }
  const users = readJSON(FILE);
  return users.find((u: any) => u.email === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { data } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  }
  const users = readJSON(FILE);
  return users.find((u: any) => u.id === id) || null;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function createUser(
  email: string, password: string, name: string, phone: string,
  opts?: { role?: string; clubName?: string; region?: string; organizerNote?: string }
): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("이미 가입된 이메일입니다.");

  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    phone,
    role: opts?.role || "user",
    clubName: opts?.clubName || "",
    region: opts?.region || "",
    organizerNote: opts?.organizerNote || "",
    skillLevel: "",
    preferredTimes: "",
    playStyle: "",
    onboardingCompleted: false,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseEnabled && supabaseAdmin) {
    const { error } = await supabaseAdmin.from(TABLE).insert(toSnake(user));
    if (error) {
      if (error.code === "23505") throw new Error("이미 가입된 이메일입니다.");
      throw new Error(error.message);
    }
  } else {
    const users = readJSON(FILE);
    users.push(user);
    writeJSON(FILE, users);
  }

  return user;
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "email" | "passwordHash" | "createdAt">>): Promise<User | null> {
  const now = new Date().toISOString();
  const safeUpdates = { ...updates, updatedAt: now };

  if (isSupabaseEnabled && supabaseAdmin) {
    const snaked = toSnake(safeUpdates);
    delete snaked.id;
    delete snaked.created_at;
    const { data, error } = await supabaseAdmin.from(TABLE).update(snaked).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data ? toCamel(data) : null;
  }

  const users = readJSON(FILE);
  const idx = users.findIndex((u: any) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...safeUpdates };
  writeJSON(FILE, users);
  return users[idx];
}
