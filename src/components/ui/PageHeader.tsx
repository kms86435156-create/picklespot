"use client";

import { motion } from "framer-motion";
import SystemLabel from "./SystemLabel";

interface PageHeaderProps {
  sysLabel: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  color?: "cyan" | "red";
}

export default function PageHeader({ sysLabel, title, highlight, subtitle, color = "cyan" }: PageHeaderProps) {
  const highlightColor = color === "cyan" ? "text-brand-cyan" : "text-brand-red";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <SystemLabel text={sysLabel} color={color} />
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mt-3 leading-tight">
        {title}
        {highlight && <span className={` ${highlightColor}`}> {highlight}</span>}
      </h1>
      {subtitle && <p className="text-text-muted mt-2 text-base">{subtitle}</p>}
    </motion.div>
  );
}
