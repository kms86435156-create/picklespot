import "server-only";
import { readJSON, writeJSON, toSnake, toCamel } from "./db";
import { supabaseAdmin, isSupabaseEnabled } from "./supabase";

const FILE = "feedbacks.json";
const TABLE = "feedbacks";

// feedbacks 테이블이 Supabase에 없을 수 있으므로 런타임 체크
let _tableOk: boolean | null = null;
async function canUseSupabase(): Promise<boolean> {
  if (!isSupabaseEnabled || !supabaseAdmin) return false;
  if (_tableOk !== null) return _tableOk;
  const { error } = await supabaseAdmin.from(TABLE).select("id").limit(1);
  _tableOk = !error || error.code !== "PGRST205";
  if (!_tableOk) console.warn("[feedbacks] 테이블 미존재 → JSON fallback");
  return _tableOk;
}

export interface Feedback {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  category: string;
  title: string;
  message: string;
  status: string;
  adminNote: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = [
  { value: "bug", label: "버그 신고" },
  { value: "feature", label: "기능 제안" },
  { value: "complaint", label: "불만/민원" },
  { value: "general", label: "일반 문의" },
] as const;

export const STATUSES = [
  { value: "pending", label: "대기" },
  { value: "in_progress", label: "처리중" },
  { value: "resolved", label: "완료" },
  { value: "dismissed", label: "반려" },
] as const;

export async function createFeedback(input: {
  userId?: string | null;
  userName: string;
  userEmail: string;
  category: string;
  title: string;
  message: string;
}): Promise<Feedback> {
  const now = new Date().toISOString();
  const feedback: Feedback = {
    id: crypto.randomUUID(),
    userId: input.userId || null,
    userName: input.userName,
    userEmail: input.userEmail,
    category: input.category || "general",
    title: input.title,
    message: input.message,
    status: "pending",
    adminNote: "",
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  if (await canUseSupabase()) {
    const { error } = await supabaseAdmin!.from(TABLE).insert(toSnake(feedback));
    if (error) throw new Error(error.message);
  } else {
    const list = readJSON(FILE);
    list.push(feedback);
    writeJSON(FILE, list);
  }
  return feedback;
}

export interface FeedbackListFilters {
  category?: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface FeedbackListResult {
  items: Feedback[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listFeedbacks(filters: FeedbackListFilters = {}): Promise<FeedbackListResult> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  if (await canUseSupabase()) {
    let q = supabaseAdmin!.from(TABLE).select("*", { count: "exact" });
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.status) q = q.eq("status", filters.status);
    if (filters.keyword) {
      q = q.or(`title.ilike.%${filters.keyword}%,message.ilike.%${filters.keyword}%,user_name.ilike.%${filters.keyword}%`);
    }
    q = q.order("created_at", { ascending: false });
    q = q.range((page - 1) * limit, page * limit - 1);
    const { data, count } = await q;
    const total = count || 0;
    return {
      items: (data || []).map(toCamel) as Feedback[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  let list: Feedback[] = readJSON(FILE);
  if (filters.category) list = list.filter(f => f.category === filters.category);
  if (filters.status) list = list.filter(f => f.status === filters.status);
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    list = list.filter(f =>
      f.title?.toLowerCase().includes(kw) ||
      f.message?.toLowerCase().includes(kw) ||
      f.userName?.toLowerCase().includes(kw)
    );
  }
  list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const total = list.length;
  const items = list.slice((page - 1) * limit, page * limit);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getFeedback(id: string): Promise<Feedback | null> {
  if (await canUseSupabase()) {
    const { data } = await supabaseAdmin!.from(TABLE).select("*").eq("id", id).single();
    return data ? toCamel(data) as Feedback : null;
  }
  return readJSON(FILE).find((f: any) => f.id === id) || null;
}

export async function updateFeedback(id: string, updates: Partial<Pick<Feedback, "status" | "adminNote">>): Promise<Feedback | null> {
  const now = new Date().toISOString();
  const safeUpdates: any = { ...updates, updatedAt: now };
  if (updates.status === "resolved") safeUpdates.resolvedAt = now;

  if (await canUseSupabase()) {
    const snaked = toSnake(safeUpdates);
    const { data, error } = await supabaseAdmin!.from(TABLE).update(snaked).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data ? toCamel(data) as Feedback : null;
  }

  const list = readJSON(FILE);
  const idx = list.findIndex((f: any) => f.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...safeUpdates };
  writeJSON(FILE, list);
  return list[idx];
}

export async function getFeedbackCounts(): Promise<{ total: number; pending: number; inProgress: number; resolved: number }> {
  if (await canUseSupabase()) {
    const { count: total } = await supabaseAdmin!.from(TABLE).select("id", { count: "exact", head: true });
    const { count: pending } = await supabaseAdmin!.from(TABLE).select("id", { count: "exact", head: true }).eq("status", "pending");
    const { count: inProgress } = await supabaseAdmin!.from(TABLE).select("id", { count: "exact", head: true }).eq("status", "in_progress");
    const { count: resolved } = await supabaseAdmin!.from(TABLE).select("id", { count: "exact", head: true }).eq("status", "resolved");
    return { total: total || 0, pending: pending || 0, inProgress: inProgress || 0, resolved: resolved || 0 };
  }
  const list: Feedback[] = readJSON(FILE);
  return {
    total: list.length,
    pending: list.filter(f => f.status === "pending").length,
    inProgress: list.filter(f => f.status === "in_progress").length,
    resolved: list.filter(f => f.status === "resolved").length,
  };
}
