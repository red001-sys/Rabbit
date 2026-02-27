import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Camera, PenLine } from 'lucide-react';
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
import rabbitLogo from '@/assets/rabbit-logo.png';

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
    protein: { title: 'Proteína', description: 'Construção muscular e recuperação.', color: 'hsl(var(--protein))' },
    fat: { title: 'Gordura', description: 'Energia e absorção de vitaminas.', color: 'hsl(var(--fat))' },
    sugar: { title: 'Açúcar', description: 'Modere o consumo de açúcares simples.', color: 'hsl(var(--sugar))' },
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero Header */}
      <div className="hero-header rounded-b-[2.5rem] px-5 pt-10 pb-28 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img src={rabbitLogo} alt="Logo" className="w-9 h-9 rounded-xl" />
              <div>
                <p className="text-xs text-white/60 font-semibold">Olá,</p>
                <h1 className="text-lg font-extrabold text-white">{profile.name} 👋</h1>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main calorie card - overlapping hero */}
      <div className="px-5 -mt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[1.75rem] shadow-elevated border border-border p-6"
        >
          <div className="flex justify-center">
            <CircleProgress
              value={totals.calories}
              max={profile.dailyCalorieGoal}
              size={180}
              strokeWidth={16}
              color="hsl(var(--primary))"
              trackColor="hsl(var(--muted))"
              label=""
              unit="kcal"
            />
          </div>
          <p className="text-center text-muted-foreground text-sm font-bold mt-2">
            {remaining > 0 ? `Restam ${remaining} kcal` : '🎉 Meta atingida!'}
          </p>
        </motion.div>
      </div>

      {/* Macro circles */}
      <div className="px-5 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[1.75rem] shadow-elevated border border-border p-5 flex justify-around"
        >
          <CircleProgress
            value={totals.protein}
            max={goals.protein}
            size={80}
            strokeWidth={8}
            color="hsl(var(--protein))"
            label="Proteína"
            icon={<SteakIcon size={16} className="text-protein" />}
            unit="g"
            onClick={() => setBalloon('protein')}
          />
          <CircleProgress
            value={totals.fat}
            max={goals.fat}
            size={80}
            strokeWidth={8}
            color="hsl(var(--fat))"
            label="Gordura"
            icon={<OilDropIcon size={16} className="text-fat" />}
            unit="g"
            onClick={() => setBalloon('fat')}
          />
          <CircleProgress
            value={totals.sugar}
            max={goals.sugar}
            size={80}
            strokeWidth={8}
            color="hsl(var(--sugar))"
            label="Açúcar"
            icon={<SugarCubesIcon size={16} className="text-sugar" />}
            unit="g"
            onClick={() => setBalloon('sugar')}
          />
        </motion.div>
      </div>

      {/* Add food buttons */}
      <div className="px-5 mt-4 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
          className="w-full flex items-center justify-center gap-2.5 h-14 rounded-2xl gradient-primary text-white font-bold text-sm shadow-elevated"
        >
          <PenLine className="w-5 h-5" />
          Adicionar por texto
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEntryMode('photo'); setShowFoodEntry(true); }}
          className="w-full flex items-center justify-center gap-2.5 h-14 rounded-2xl bg-card text-foreground font-bold text-sm shadow-elevated border border-border"
        >
          <Camera className="w-5 h-5" />
          Adicionar por foto
        </motion.button>
      </div>

      {/* Today's food list */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-foreground">Hoje</h2>
          <button onClick={() => navigate('/history')} className="text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors">
            Ver histórico →
          </button>
        </div>
        {todayEntries.length === 0 ? (
          <div className="bg-card rounded-[1.5rem] shadow-elevated border border-border p-8 text-center">
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
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-4 bg-card rounded-[1.5rem] shadow-elevated border border-border"
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

      {/* Detail FAB */}
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
      <FoodEntryDialog open={showFoodEntry} onClose={() => setShowFoodEntry(false)} onAdded={refresh} dailyGoal={profile.dailyCalorieGoal} onShowAd={() => setShowAd(true)} />
      <FoodDetailSheet open={showDetail} onClose={() => setShowDetail(false)} dailyGoal={profile.dailyCalorieGoal} onUpdate={refresh} />
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} onUpdate={refresh} />
      <AdDialog open={showAd} onClose={() => setShowAd(false)} onPremium={() => { setShowAd(false); navigate('/premium'); }} />
    </div>
  );
};

export default Dashboard;
