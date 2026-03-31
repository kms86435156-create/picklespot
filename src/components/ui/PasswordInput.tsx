"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${className || ""} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-muted transition-colors"
        tabIndex={-1}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}
