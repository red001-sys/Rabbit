import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Clock, Camera, PenLine } from 'lucide-react';
import CircleProgress from '@/components/CircleProgress';
import FoodEntryDialog from '@/components/FoodEntryDialog';
import FoodDetailSheet from '@/components/FoodDetailSheet';
import SettingsDialog from '@/components/SettingsDialog';
import AdDialog from '@/components/AdDialog';
import InfoBalloon from '@/components/InfoBalloon';
import { SteakIcon, OilDropIcon, SugarCubesIcon } from '@/components/MacroIcons';
import { getProfile, getTodayTotals, getTodayEntries } from '@/lib/storage';
import { calculateDailyMacroGoals } from '@/lib/calories';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = getProfile()!;
  const [, setRefresh] = useState(0);
  const refresh = useCallback(() => setRefresh(r => r + 1), []);

  const [showFoodEntry, setShowFoodEntry] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [balloon, setBalloon] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'text' | 'photo'>('text');

  const totals = getTodayTotals();
  const goals = calculateDailyMacroGoals(profile.dailyCalorieGoal);
  const todayEntries = getTodayEntries();
  const remaining = profile.dailyCalorieGoal - totals.calories;

  const balloonData: Record<string, { title: string; description: string; color: string }> = {
    protein: {
      title: 'Proteína',
      description: 'Construção muscular e recuperação.',
      color: 'hsl(var(--protein))',
    },
    fat: {
      title: 'Gordura',
      description: 'Energia e absorção de vitaminas.',
      color: 'hsl(var(--fat))',
    },
    sugar: {
      title: 'Açúcar',
      description: 'Modere o consumo de açúcares simples.',
      color: 'hsl(var(--sugar))',
    },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <div className="hero-header rounded-b-[2rem] px-5 pt-8 pb-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-white/70">Olá,</p>
              <h1 className="text-2xl font-extrabold text-white">{profile.name} 👋</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/history')}
                className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <Clock className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Main calorie circle inside hero */}
          <div className="flex justify-center">
            <CircleProgress
              value={totals.calories}
              max={profile.dailyCalorieGoal}
              size={200}
              strokeWidth={18}
              color="hsla(0, 0%, 100%, 0.9)"
              trackColor="hsla(0, 0%, 100%, 0.15)"
              label=""
              unit="kcal"
              heroMode
            />
          </div>
          <p className="text-center text-white/70 text-sm font-semibold mt-2">
            {remaining > 0 ? `Restam ${remaining} kcal` : 'Meta atingida!'}
          </p>
        </div>
      </div>

      {/* Macro circles */}
      <div className="flex justify-center gap-6 -mt-1 px-5">
        <div className="bg-card rounded-3xl shadow-elevated p-4 flex gap-6">
          <CircleProgress
            value={totals.protein}
            max={goals.protein}
            size={85}
            strokeWidth={8}
            color="hsl(var(--protein))"
            label="Proteína"
            icon={<SteakIcon size={18} className="text-protein" />}
            unit="g"
            onClick={() => setBalloon('protein')}
          />
          <CircleProgress
            value={totals.fat}
            max={goals.fat}
            size={85}
            strokeWidth={8}
            color="hsl(var(--fat))"
            label="Gordura"
            icon={<OilDropIcon size={18} className="text-fat" />}
            unit="g"
            onClick={() => setBalloon('fat')}
          />
          <CircleProgress
            value={totals.sugar}
            max={goals.sugar}
            size={85}
            strokeWidth={8}
            color="hsl(var(--sugar))"
            label="Açúcar"
            icon={<SugarCubesIcon size={18} className="text-sugar" />}
            unit="g"
            onClick={() => setBalloon('sugar')}
          />
        </div>
      </div>

      {/* Add food buttons */}
      <div className="flex justify-center gap-3 mt-6 px-5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl gradient-primary text-white font-bold text-sm shadow-elevated"
        >
          <PenLine className="w-5 h-5" />
          Adicionar por texto
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEntryMode('photo'); setShowFoodEntry(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-card text-foreground font-bold text-sm shadow-elevated border border-border"
        >
          <Camera className="w-5 h-5" />
          Adicionar por foto
        </motion.button>
      </div>

      {/* Today's food list */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-foreground">Hoje</h2>
          <button onClick={() => navigate('/history')} className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors">
            <Clock className="w-3.5 h-3.5" /> Histórico
          </button>
        </div>
        {todayEntries.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-elevated p-8 text-center">
            <p className="text-3xl mb-2">🥗</p>
            <p className="text-sm text-muted-foreground font-semibold">Nenhum alimento registrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-elevated border border-border"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🍽️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-foreground capitalize truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.quantity}</p>
                </div>
                <p className="text-sm font-extrabold text-foreground whitespace-nowrap">{entry.nutrients.calories} kcal</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Add food (bottom left) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
        className="fixed bottom-6 left-5 w-16 h-16 rounded-2xl gradient-primary shadow-elevated flex items-center justify-center z-30"
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>

      {/* FAB - Detail (bottom right) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDetail(true)}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-2xl bg-card shadow-elevated border border-border flex items-center justify-center z-30"
      >
        <span className="text-lg">📊</span>
      </motion.button>

      {/* Info balloons */}
      {balloon && balloonData[balloon] && (
        <InfoBalloon
          visible={true}
          title={balloonData[balloon].title}
          description={balloonData[balloon].description}
          color={balloonData[balloon].color}
          onClose={() => setBalloon(null)}
        />
      )}

      {/* Dialogs */}
      <FoodEntryDialog
        open={showFoodEntry}
        onClose={() => setShowFoodEntry(false)}
        onAdded={refresh}
        dailyGoal={profile.dailyCalorieGoal}
        onShowAd={() => setShowAd(true)}
      />

      <FoodDetailSheet
        open={showDetail}
        onClose={() => setShowDetail(false)}
        dailyGoal={profile.dailyCalorieGoal}
        onUpdate={refresh}
      />

      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={refresh}
      />

      <AdDialog
        open={showAd}
        onClose={() => setShowAd(false)}
        onPremium={() => { setShowAd(false); navigate('/premium'); }}
      />
    </div>
  );
};

export default Dashboard;
