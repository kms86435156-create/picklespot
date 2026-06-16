"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import LoginModal from "./LoginModal";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  region?: string;
  skillLevel?: string;
  preferredTimes?: string;
  playStyle?: string;
  onboardingCompleted?: boolean;
  clubName?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** 로그인이 필요한 액션 실행 시 호출. 로그인 안 된 경우 모달 표시 후 로그인 완료 시 callback 실행 */
  requireLogin: (callback?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  requireLogin: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const pendingCallbackRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const requireLogin = useCallback((callback?: () => void): boolean => {
    if (user) return true;
    pendingCallbackRef.current = callback || null;
    setLoginModalOpen(true);
    return false;
  }, [user]);

  const handleLoginSuccess = useCallback(() => {
    setLoginModalOpen(false);
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    if (cb) {
      // 약간의 딜레이로 상태 업데이트 후 콜백 실행
      setTimeout(cb, 100);
    }
  }, []);

  const handleLoginClose = useCallback(() => {
    setLoginModalOpen(false);
    pendingCallbackRef.current = null;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, requireLogin }}>
      {children}
      <LoginModal
        open={loginModalOpen}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
        refresh={refresh}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
