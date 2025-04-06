import React from "react";
import { Loader2 } from "lucide-react";

interface ILoadingProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function Loading({
  size = 24,
  className = "my-4",
  color = "primary",
}: ILoadingProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className={`animate-spin text-${color}`} />
    </div>
  );
}
