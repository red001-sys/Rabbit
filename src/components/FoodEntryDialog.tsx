import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Camera, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveEntry, getTodayTotals, incrementAdCount, isPremium } from '@/lib/storage';
import { FoodEntry, NutrientInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface FoodEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  dailyGoal: number;
  onShowAd: () => void;
}

interface AIFood {
  name: string;
  quantity: string;
  grams: number;
  nutrients: NutrientInfo;
  isEstimate?: boolean;
}

interface AIResponse {
  foods?: AIFood[];
  needsQuantity?: boolean;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  error?: string | null;
}

const FoodEntryDialog = ({ open, onClose, onAdded, dailyGoal, onShowAd }: FoodEntryDialogProps) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'text' | 'photo'>('text');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFood = async (text?: string, photo?: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    setWarning('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-food', {
        body: {
          text: text || undefined,
          imageBase64: photo || undefined,
          mode: photo ? 'photo' : 'text',
        },
      });

      if (fnError) {
        setError('Erro ao analisar alimento. Tente novamente.');
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      // Check daily goal warning
      if (data.foods?.length) {
        const todayTotals = getTodayTotals();
        const totalNewCals = data.foods.reduce((s: number, f: AIFood) => s + f.nutrients.calories, 0);
        const newTotal = todayTotals.calories + totalNewCals;
        if (newTotal > dailyGoal) {
          setWarning(`Atenção: vai ultrapassar sua meta (${Math.round(newTotal)} / ${dailyGoal} kcal).`);
        } else if (newTotal > dailyGoal * 0.9) {
          setWarning(`Perto da meta (${Math.round(newTotal)} / ${dailyGoal} kcal).`);
        }
      }

      setResult(data);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'photo' && imageBase64) {
      analyzeFood(undefined, imageBase64);
    } else if (input.trim()) {
      analyzeFood(input.trim());
    }
  };

  const handleAddFood = (food: AIFood) => {
    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: food.name,
      quantity: food.quantity,
      nutrients: food.nutrients,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    saveEntry(entry);

    if (!isPremium()) {
      const count = incrementAdCount();
      if (count % 6 === 0) {
        onShowAd();
      }
    }

    setInput('');
    setResult(null);
    setWarning('');
    setImagePreview(null);
    setImageBase64(null);
    onAdded();
    onClose();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Adicionar Alimento</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setMode('text'); setImagePreview(null); setImageBase64(null); setResult(null); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'text' ? 'gradient-primary text-white' : 'bg-accent text-accent-foreground'
              }`}
            >
              Texto
            </button>
            <button
              onClick={() => { setMode('photo'); setResult(null); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                mode === 'photo' ? 'gradient-primary text-white' : 'bg-accent text-accent-foreground'
              }`}
            >
              Foto
            </button>
          </div>

          {mode === 'text' ? (
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                placeholder='Ex: "2 ovos fritos", "um pedaço de pizza", "200g de arroz com frango"'
                className="min-h-[80px] resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                maxLength={500}
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="w-full h-11 gradient-primary text-primary-foreground font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {loading ? 'Analisando...' : 'Analisar'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Foto do alimento" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="absolute top-2 right-2 p-1 bg-foreground/50 rounded-full"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-semibold">Tire ou selecione uma foto</span>
                </button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={loading || !imageBase64}
                className="w-full h-11 gradient-primary text-primary-foreground font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {loading ? 'Analisando...' : 'Analisar foto'}
              </Button>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mt-3 font-semibold">
              {error}
            </motion.p>
          )}

          {warning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 mt-3 p-3 bg-carbs/10 rounded-lg border border-carbs/30">
              <AlertTriangle className="w-4 h-4 text-carbs mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">{warning}</p>
            </motion.div>
          )}

          {result?.needsClarification && result.clarificationQuestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-accent/50 rounded-xl">
              <p className="text-sm font-semibold text-foreground">🤖 {result.clarificationQuestion}</p>
            </motion.div>
          )}

          {result?.needsQuantity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-accent/50 rounded-xl">
              <p className="text-sm font-semibold text-foreground">🤖 Qual foi a quantidade aproximada?</p>
            </motion.div>
          )}

          {result?.foods && result.foods.length > 0 && (
            <div className="mt-4 space-y-3">
              {result.foods.map((food, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-accent/50 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground capitalize">{food.name}</h3>
                    <span className="text-xs text-muted-foreground">{food.quantity}</span>
                  </div>
                  {food.isEstimate && (
                    <p className="text-xs text-muted-foreground italic">⚠️ Valores estimados</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-card rounded-lg p-2 shadow-card">
                      <p className="text-lg font-bold text-foreground">{food.nutrients.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="bg-card rounded-lg p-2 shadow-card">
                      <p className="text-lg font-bold text-protein">{food.nutrients.protein}g</p>
                      <p className="text-xs text-muted-foreground">proteína</p>
                    </div>
                    <div className="bg-card rounded-lg p-2 shadow-card">
                      <p className="text-lg font-bold text-carbs">{food.nutrients.carbs}g</p>
                      <p className="text-xs text-muted-foreground">carbos</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddFood(food)}
                    className="w-full h-10 gradient-primary text-primary-foreground font-bold"
                  >
                    <Check className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodEntryDialog;
