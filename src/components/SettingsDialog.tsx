import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProfile, saveProfile } from '@/lib/storage';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const SettingsDialog = ({ open, onClose, onUpdate }: SettingsDialogProps) => {
  const profile = getProfile();
  const [calorieGoal, setCalorieGoal] = useState(profile?.dailyCalorieGoal.toString() || '2000');

  const handleSave = () => {
    if (!profile) return;
    const goal = parseInt(calorieGoal);
    if (goal > 500 && goal < 10000) {
      saveProfile({ ...profile, dailyCalorieGoal: goal });
      onUpdate();
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
        className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-soft"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">⚙️ Configurações</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold">Meta de calorias diária</Label>
            <Input
              type="number"
              value={calorieGoal}
              onChange={e => setCalorieGoal(e.target.value)}
              className="h-11"
              min={500}
              max={10000}
            />
            <p className="text-xs text-muted-foreground">
              Meta calculada: {profile?.dailyCalorieGoal} kcal
            </p>
          </div>

          <Button onClick={handleSave} className="w-full h-11 gradient-primary text-primary-foreground font-bold mt-4">
            Salvar
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsDialog;
