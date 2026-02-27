import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CircleProgressProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor?: string;
  label: string;
  unit?: string;
  icon?: ReactNode;
  onClick?: () => void;
  heroMode?: boolean;
  displayText?: string;
  macroLabel?: string;
  macroGoal?: string;
}

const CircleProgress = ({ value, max, size, strokeWidth, color, trackColor, label, unit = '', icon, onClick, heroMode, displayText, macroLabel, macroGoal }: CircleProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;
  const isOver = value > max;

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer select-none"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor || "hsl(var(--muted))"}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOver ? 'hsl(var(--destructive))' : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <span className="flex items-center justify-center" style={{ width: size > 120 ? 28 : 22, height: size > 120 ? 28 : 22 }}>{icon}</span>}
          {displayText ? (
            <>
              <span className="text-3xl font-extrabold text-foreground">{displayText}</span>
              {unit && <span className="text-xs font-semibold text-muted-foreground">{unit}</span>}
            </>
          ) : !icon && (
            <>
              <span className={`font-extrabold ${heroMode ? 'text-4xl text-white' : size > 120 ? 'text-2xl' : 'text-sm'}`}>
                {Math.round(value)}
              </span>
              {unit && <span className={`text-xs font-semibold ${heroMode ? 'text-white/70' : 'text-muted-foreground'}`}>{unit}</span>}
            </>
          )}
        </div>
      </div>
      {macroLabel ? (
        <div className="flex flex-col items-center">
          <span className="text-sm font-extrabold text-foreground">{macroLabel}</span>
          <span className="text-xs text-muted-foreground">{macroGoal}</span>
        </div>
      ) : (
        label && <span className="text-xs font-bold text-muted-foreground">{label}</span>
      )}
    </motion.div>
  );
};

export default CircleProgress;
