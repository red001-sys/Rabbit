import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetAdCount } from '@/lib/storage';

interface AdDialogProps {
  open: boolean;
  onClose: () => void;
  onPremium: () => void;
}

const AdDialog = ({ open, onClose, onPremium }: AdDialogProps) => {
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (watching && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (watching && countdown === 0) {
      setCanClose(true);
      setWatching(false);
      resetAdCount();
    }
  }, [watching, countdown]);

  const handleWatch = () => {
    setWatching(true);
    setCountdown(5);
  };

  const handleClose = () => {
    if (canClose || !watching) {
      setCanClose(false);
      setWatching(false);
      setCountdown(5);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/60 z-[60] flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-soft relative"
        >
          {/* Small X at top */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {watching ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">{countdown}</span>
              </div>
              <p className="text-sm text-muted-foreground">Aguarde o anúncio terminar...</p>
            </div>
          ) : canClose ? (
            <div className="text-center py-6">
              <p className="text-lg font-bold text-foreground mb-2">✅ Obrigado!</p>
              <p className="text-sm text-muted-foreground mb-4">Continue registrando seus alimentos.</p>
              <Button onClick={handleClose} className="gradient-primary text-primary-foreground font-bold">
                Continuar
              </Button>
            </div>
          ) : (
            <div className="text-center pt-4 space-y-3">
              <p className="text-lg font-bold text-foreground">📢 Pausa rápida</p>
              <p className="text-sm text-muted-foreground mb-4">Escolha uma opção para continuar:</p>
              <div className="space-y-2.5">
                <Button onClick={onPremium} variant="outline" className="w-full h-11 font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  ⭐ Remover anúncios (Premium)
                </Button>
                <Button onClick={handleWatch} className="w-full h-11 gradient-primary text-primary-foreground font-bold">
                  ▶️ Assistir anúncio completo
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdDialog;
