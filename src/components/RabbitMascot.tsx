import { motion } from 'framer-motion';
import rabbitImg from '@/assets/rabbit-mascot.png';

interface RabbitMascotProps {
  message?: string;
  size?: number;
}

const RabbitMascot = ({ message, size = 80 }: RabbitMascotProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card shadow-card rounded-lg px-4 py-2 text-sm font-semibold text-foreground max-w-[220px] text-center border border-border"
        >
          {message}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-b border-r border-border rotate-45" />
        </motion.div>
      )}
      <motion.img
        src={rabbitImg}
        alt="Mascote coelho"
        style={{ width: size, height: size }}
        className="object-contain animate-bounce-gentle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      />
    </div>
  );
};

export default RabbitMascot;
