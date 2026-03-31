import "server-only";
import { readJSON, writeJSON } from "./db";
import { hashPassword, verifyPassword } from "./auth";
import { supabaseAdmin, isSupabaseEnabled } from "./supabase";

const FILE = "admin-users.json";
const TABLE = "admin_users";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
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

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("email", email.toLowerCase())
      .single();
    return data ? toCamel(data) : null;
  }
  const users = readJSON(FILE);
  return users.find((u: any) => u.email === email.toLowerCase()) || null;
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    return data ? toCamel(data) : null;
  }
  const users = readJSON(FILE);
  return users.find((u: any) => u.id === id) || null;
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const user = await findAdminByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function createAdminUser(
  email: string,
  password: string,
  name: string
): Promise<AdminUser> {
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    passwordHash: await hashPassword(password),
    role: "admin",
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseEnabled && supabaseAdmin) {
    const { error } = await supabaseAdmin.from(TABLE).insert(toSnake(user));
    if (error) throw new Error(error.message);
  } else {
    const users = readJSON(FILE);
    users.push(user);
    writeJSON(FILE, users);
  }

  return user;
}
