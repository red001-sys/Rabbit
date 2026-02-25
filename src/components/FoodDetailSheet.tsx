import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { FoodEntry, NutrientInfo } from '@/types';
import { calculateDailyMacroGoals } from '@/lib/calories';
import { deleteEntry, getTodayEntries, getTodayTotals } from '@/lib/storage';

interface FoodDetailSheetProps {
  open: boolean;
  onClose: () => void;
  dailyGoal: number;
  onUpdate: () => void;
}

const NutrientRow = ({ label, value, goal, unit, color }: {
  label: string; value: number; goal: number; unit: string; color: string;
}) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const excess = value > goal ? value - goal : 0;
  const remaining = value < goal ? goal - value : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value * 10) / 10}{unit} / {goal}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {excess > 0
          ? `⚠️ Excesso de ${Math.round(excess * 10) / 10}${unit}`
          : `Faltam ${Math.round(remaining * 10) / 10}${unit}`
        }
      </p>
    </div>
  );
};

const FoodDetailSheet = ({ open, onClose, dailyGoal, onUpdate }: FoodDetailSheetProps) => {
  const entries = getTodayEntries();
  const totals = getTodayTotals();
  const goals = calculateDailyMacroGoals(dailyGoal);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    onUpdate();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-card w-full max-w-md rounded-t-2xl p-6 shadow-soft max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Detalhes Nutricionais</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nutrient bars */}
          <div className="space-y-4 mb-6">
            <NutrientRow label="🔥 Calorias" value={totals.calories} goal={dailyGoal} unit="kcal" color="hsl(var(--primary))" />
            <NutrientRow label="🥩 Proteína" value={totals.protein} goal={goals.protein} unit="g" color="hsl(var(--protein))" />
            <NutrientRow label="🍞 Carboidratos" value={totals.carbs} goal={goals.carbs} unit="g" color="hsl(var(--carbs))" />
            <NutrientRow label="🧊 Açúcar" value={totals.sugar} goal={goals.sugar} unit="g" color="hsl(var(--sugar))" />
            <NutrientRow label="🧈 Gordura" value={totals.fat} goal={goals.fat} unit="g" color="hsl(var(--fat))" />
            <NutrientRow label="🧂 Sódio" value={totals.sodium} goal={goals.sodium} unit="mg" color="hsl(var(--sodium))" />
            {totals.fiber !== undefined && totals.fiber > 0 && (
              <NutrientRow label="🌾 Fibra" value={totals.fiber} goal={25} unit="g" color="hsl(var(--primary))" />
            )}
          </div>

          {/* Food entries */}
          <h3 className="text-sm font-bold text-muted-foreground mb-3">Alimentos de hoje</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum alimento registrado hoje.</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground capitalize">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.nutrients.calories} kcal</p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodDetailSheet;
