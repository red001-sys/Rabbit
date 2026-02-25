import { motion, AnimatePresence } from 'framer-motion';

interface InfoBalloonProps {
  visible: boolean;
  title: string;
  description: string;
  color: string;
  onClose: () => void;
}

const InfoBalloon = ({ visible, title, description, color, onClose }: InfoBalloonProps) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl p-5 shadow-soft border border-border max-w-[260px] w-full"
          style={{ borderTopColor: color, borderTopWidth: 3 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoBalloon;
