"use client";

import { useState, useEffect } from "react";
import { Calendar, AlertTriangle } from "lucide-react";

interface ExpirationTimerProps {
  enrolledAt: string;
  expirationDays: number;
  className?: string;
}

export function ExpirationTimer({ enrolledAt, expirationDays, className = "" }: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!enrolledAt || !expirationDays || expirationDays <= 0) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const enrollmentDate = new Date(enrolledAt);
      const expirationDate = new Date(enrollmentDate.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
      const now = new Date();
      const difference = expirationDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, expired: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes, expired: false };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    // Atualizar imediatamente
    updateTimer();

    // Atualizar a cada minuto
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [enrolledAt, expirationDays]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-1 bg-red-500/80 backdrop-blur-sm rounded-full px-2 py-1 ${className}`}>
        <AlertTriangle className="w-3 h-3 text-white" />
        <span className="text-white text-xs font-medium">Expirado</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days <= 3;
  const bgColor = isUrgent ? "bg-red-500/80" : timeLeft.days <= 7 ? "bg-orange-500/80" : "bg-green-500/80";

  return (
    <div className={`flex items-center gap-1 ${bgColor} backdrop-blur-sm rounded-full px-2 py-1 ${className}`}>
      <Calendar className="w-3 h-3 text-white" />
      <span className="text-white text-xs font-medium">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes}m
      </span>
    </div>
  );
}
