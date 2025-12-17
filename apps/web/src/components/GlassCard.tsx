import React from "react";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={
        "rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}
