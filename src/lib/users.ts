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
  status: string; // "active" | "suspended" | "withdrawn"
  suspendedReason: string;
  suspendedAt: string;
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
    status: "active",
    suspendedReason: "",
    suspendedAt: "",
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

// ═══ 관리자용 함수 ═══

export interface UserListFilters {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserListResult {
  items: Omit<User, "passwordHash">[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function stripPassword(user: any): Omit<User, "passwordHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, password_hash, ...rest } = user;
  return rest;
}

export async function listUsers(filters: UserListFilters = {}): Promise<UserListResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  if (isSupabaseEnabled && supabaseAdmin) {
    let q = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
    if (filters.keyword) {
      q = q.or(`name.ilike.%${filters.keyword}%,email.ilike.%${filters.keyword}%,phone.ilike.%${filters.keyword}%`);
    }
    if (filters.role) q = q.eq("role", filters.role);
    if (filters.status) q = q.eq("status", filters.status);
    q = q.order("created_at", { ascending: false });
    q = q.range((page - 1) * limit, page * limit - 1);
    const { data, count } = await q;
    const total = count || 0;
    return {
      items: (data || []).map((u: any) => stripPassword(toCamel(u))),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  let users = readJSON(FILE);
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    users = users.filter((u: any) =>
      u.name?.toLowerCase().includes(kw) ||
      u.email?.toLowerCase().includes(kw) ||
      u.phone?.includes(kw)
    );
  }
  if (filters.role) users = users.filter((u: any) => u.role === filters.role);
  if (filters.status) users = users.filter((u: any) => (u.status || "active") === filters.status);
  users.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const total = users.length;
  const items = users.slice((page - 1) * limit, page * limit).map(stripPassword);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserDetail(id: string): Promise<Omit<User, "passwordHash"> | null> {
  const user = await findUserById(id);
  if (!user) return null;
  return stripPassword(user);
}

export async function suspendUser(id: string, reason: string): Promise<User | null> {
  return updateUser(id, {
    status: "suspended",
    suspendedReason: reason,
    suspendedAt: new Date().toISOString(),
  });
}

export async function activateUser(id: string): Promise<User | null> {
  return updateUser(id, {
    status: "active",
    suspendedReason: "",
    suspendedAt: "",
  });
}

export async function getUserCount(): Promise<{ total: number; active: number; suspended: number }> {
  if (isSupabaseEnabled && supabaseAdmin) {
    const { count: total } = await supabaseAdmin.from(TABLE).select("id", { count: "exact", head: true });
    const { count: suspended } = await supabaseAdmin.from(TABLE).select("id", { count: "exact", head: true }).eq("status", "suspended");
    const t = total || 0;
    const s = suspended || 0;
    return { total: t, active: t - s, suspended: s };
  }
  const users = readJSON(FILE);
  const suspended = users.filter((u: any) => u.status === "suspended").length;
  return { total: users.length, active: users.length - suspended, suspended };
}
