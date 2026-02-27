import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseFoodInput, lookupFood, getAvailableFoods } from '@/lib/calories';
import { saveEntry, getTodayTotals, incrementAdCount, getAdCount, isPremium } from '@/lib/storage';
import { FoodEntry, NutrientInfo } from '@/types';

const PORTION_TYPES = [
  { label: 'g', factor: 1 },
  { label: 'unidade', factor: 100 },
  { label: 'colher', factor: 15 },
  { label: 'fatia', factor: 30 },
];

interface FoodEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  dailyGoal: number;
  onShowAd: () => void;
}

const FoodEntryDialog = ({ open, onClose, onAdded, dailyGoal, onShowAd }: FoodEntryDialogProps) => {
  const [input, setInput] = useState('');
  const [portion, setPortion] = useState('g');
  const [portionQty, setPortionQty] = useState('100');
  const [result, setResult] = useState<{ name: string; grams: number; nutrients: NutrientInfo } | null>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableFoods = getAvailableFoods();

  const handleSearch = () => {
    setError('');
    setWarning('');
    setResult(null);

    const qty = parseInt(portionQty) || 100;
    const portionData = PORTION_TYPES.find(p => p.label === portion);
    const grams = portion === 'g' ? qty : qty * (portionData?.factor || 100);

    // Try direct name first
    const name = input.trim().toLowerCase();
    if (!name) {
      setError('Digite o nome do alimento.');
      return;
    }

    const nutrients = lookupFood(name, grams);
    if (!nutrients) {
      setError('Alimento não encontrado.');
      setShowSuggestions(true);
      return;
    }

    const todayTotals = getTodayTotals();
    const newTotal = todayTotals.calories + nutrients.calories;
    if (newTotal > dailyGoal) {
      setWarning(`Atenção: vai ultrapassar sua meta (${Math.round(newTotal)} / ${dailyGoal} kcal).`);
    } else if (newTotal > dailyGoal * 0.9) {
      setWarning(`Perto da meta (${Math.round(newTotal)} / ${dailyGoal} kcal).`);
    }

    setResult({ name, grams, nutrients });
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (!result) return;

    const portionLabel = portion === 'g' ? `${result.grams}g` : `${portionQty} ${portion}(s)`;

    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: result.name,
      quantity: portionLabel,
      nutrients: result.nutrients,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    saveEntry(entry);
    
    if (!isPremium()) {
      const count = incrementAdCount();
      if (count % 3 === 0) {
        onShowAd();
      }
    }

    setInput('');
    setResult(null);
    setWarning('');
    onAdded();
    onClose();
  };

  const handleSuggestionClick = (food: string) => {
    setInput(`100g de ${food}`);
    setShowSuggestions(false);
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
          className="bg-card w-full max-w-md rounded-t-2xl p-6 shadow-soft"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Adicionar Alimento</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            <Input
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              placeholder='Ex: "arroz", "frango", "banana"'
              className="h-11"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              maxLength={100}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={portionQty}
                onChange={e => setPortionQty(e.target.value)}
                className="h-11 w-20"
                min={1}
                max={5000}
              />
              <div className="flex gap-1.5 flex-1 overflow-x-auto">
                {PORTION_TYPES.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setPortion(p.label)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      portion === p.label
                        ? 'gradient-primary text-white'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Button onClick={handleSearch} className="h-11 gradient-primary text-primary-foreground">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mt-2 font-semibold">
              {error}
            </motion.p>
          )}

          {showSuggestions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Alimentos disponíveis:</p>
              <div className="flex flex-wrap gap-1.5">
                {availableFoods.map(food => (
                  <button
                    key={food}
                    onClick={() => handleSuggestionClick(food)}
                    className="px-2.5 py-1 bg-accent text-accent-foreground text-xs rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {food}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {warning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 mt-3 p-3 bg-carbs/10 rounded-lg border border-carbs/30">
              <AlertTriangle className="w-4 h-4 text-carbs mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">{warning}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-accent/50 rounded-xl space-y-2"
            >
              <h3 className="font-bold text-foreground capitalize">{result.grams}g de {result.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-card rounded-lg p-2 shadow-card">
                  <p className="text-lg font-bold text-foreground">{result.nutrients.calories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="bg-card rounded-lg p-2 shadow-card">
                  <p className="text-lg font-bold text-protein">{result.nutrients.protein}g</p>
                  <p className="text-xs text-muted-foreground">proteína</p>
                </div>
                <div className="bg-card rounded-lg p-2 shadow-card">
                  <p className="text-lg font-bold text-carbs">{result.nutrients.carbs}g</p>
                  <p className="text-xs text-muted-foreground">carbos</p>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full h-11 gradient-primary text-primary-foreground font-bold mt-2">
                Adicionar ✓
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodEntryDialog;
