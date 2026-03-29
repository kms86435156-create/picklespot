"use client";

import { Inbox } from "lucide-react";
import TechCorners from "./TechCorners";

interface EmptyStateProps {
  message: string;
  description?: string;
}

export default function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-8 bg-ui-bg/30 border border-ui-border rounded-sm card-grid-bg">
      <TechCorners />
      <Inbox className="w-12 h-12 text-text-muted/30 mb-4" />
      <p className="text-text-muted font-bold text-center">{message}</p>
      {description && <p className="text-text-muted/60 text-sm mt-1 text-center">{description}</p>}
    </div>
  );
}
