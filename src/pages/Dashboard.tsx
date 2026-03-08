import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initAdMob, showInterstitialAd } from '@/lib/admob';
import { Settings, Camera, Sparkles, ChevronRight, Trash2 } from 'lucide-react';
import CircleProgress from '@/components/CircleProgress';
import FoodEntryDialog from '@/components/FoodEntryDialog';
import FoodDetailSheet from '@/components/FoodDetailSheet';
import SettingsDialog from '@/components/SettingsDialog';
import AdDialog from '@/components/AdDialog';
import InfoBalloon from '@/components/InfoBalloon';
import { SteakIcon, OilDropIcon, SugarCubesIcon } from '@/components/MacroIcons';
import { getProfile, getTodayTotals, getTodayEntries, deleteEntry } from '@/lib/storage';
import { calculateDailyMacroGoals } from '@/lib/calories';
import { useNavigate } from 'react-router-dom';
import { MASCOT_LOGO } from '@/lib/mascot';
import AdBanner from '@/components/AdBanner';

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

  useEffect(() => { initAdMob(); }, []);

  const handleShowAd = useCallback(async () => {
    const shown = await showInterstitialAd();
    if (!shown) setShowAd(true); // fallback to web AdDialog
  }, []);

  const totals = getTodayTotals();
  const goals = calculateDailyMacroGoals(profile.dailyCalorieGoal);
  const todayEntries = getTodayEntries();
  const remaining = profile.dailyCalorieGoal - totals.calories;
  const percentage = Math.min(Math.round((totals.calories / profile.dailyCalorieGoal) * 100), 100);

  const balloonData: Record<string, { title: string; description: string; color: string }> = {
    protein: { title: 'Proteína', description: 'Construção muscular e recuperação.', color: 'hsl(var(--protein))' },
    fat: { title: 'Gordura', description: 'Energia e absorção de vitaminas.', color: 'hsl(var(--fat))' },
    sugar: { title: 'Açúcar', description: 'Modere o consumo de açúcares simples.', color: 'hsl(var(--sugar))' },
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Green Header */}
      <div className="hero-header px-5 pt-8 pb-28 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src={MASCOT_LOGO} alt="Logo" className="w-10 h-10 rounded-xl" />
              <div>
                <p className="text-xs text-white/70 font-semibold">Olá,</p>
                <h1 className="text-lg font-extrabold text-white">{profile.name}</h1>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Calorie info centered in green */}
          <div className="text-center">
            <p className="text-sm text-white/70 font-semibold">Calorias de hoje</p>
            <p className="text-5xl font-extrabold text-white mt-1">{totals.calories}</p>
            <p className="text-sm text-white/70 font-semibold mt-1">de {profile.dailyCalorieGoal} kcal</p>
          </div>
        </div>
      </div>

      {/* Overlapping progress card */}
      <div className="px-5 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[1.75rem] shadow-elevated border border-border p-8"
        >
          <div className="flex justify-center">
            <CircleProgress
              value={percentage}
              max={100}
              size={180}
              strokeWidth={14}
              color="hsl(var(--primary))"
              trackColor="hsl(var(--muted))"
              label=""
              unit="da meta"
              displayText={`${percentage}%`}
            />
          </div>
          <p className="text-center text-muted-foreground text-sm font-bold mt-3">
            {remaining <= 0 ? 'Meta atingida! 🎉' : `Restam ${remaining} kcal`}
          </p>
        </motion.div>
      </div>

      {/* Ad banner - only for free users */}
      <div className="px-5 mt-4">
        <AdBanner format="horizontal" className="rounded-2xl overflow-hidden" />
      </div>

      {/* Macronutrientes card */}
      <div className="px-5 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[1.75rem] shadow-elevated border border-border p-5"
        >
          <button
            onClick={() => setShowDetail(true)}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-base font-bold text-muted-foreground">Macronutrientes</h2>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex justify-around">
            <CircleProgress
              value={totals.protein}
              max={goals.protein}
              size={90}
              strokeWidth={8}
              color="hsl(var(--protein))"
              label=""
              icon={<SteakIcon size={22} className="text-protein" />}
              unit=""
              onClick={() => setBalloon('protein')}
              macroLabel={`${Math.round(totals.protein)}g`}
              macroGoal={`de ${goals.protein}g`}
            />
            <CircleProgress
              value={totals.fat}
              max={goals.fat}
              size={90}
              strokeWidth={8}
              color="hsl(var(--fat))"
              label=""
              icon={<OilDropIcon size={22} className="text-fat" />}
              unit=""
              onClick={() => setBalloon('fat')}
              macroLabel={`${Math.round(totals.fat)}g`}
              macroGoal={`de ${goals.fat}g`}
            />
            <CircleProgress
              value={totals.sugar}
              max={goals.sugar}
              size={90}
              strokeWidth={8}
              color="hsl(var(--sugar))"
              label=""
              icon={<SugarCubesIcon size={22} className="text-sugar" />}
              unit=""
              onClick={() => setBalloon('sugar')}
              macroLabel={`${Math.round(totals.sugar)}g`}
              macroGoal={`de ${goals.sugar}g`}
            />
          </div>
        </motion.div>
      </div>

      {/* Side-by-side action buttons */}
      <div className="px-5 mt-4 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
          className="flex-1 flex flex-col items-start gap-1 p-4 rounded-[1.5rem] bg-card shadow-elevated border border-border"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-extrabold text-foreground">Adicionar por texto</p>
          <p className="text-xs text-muted-foreground">Descreva o alimento</p>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEntryMode('photo'); setShowFoodEntry(true); }}
          className="flex-1 flex flex-col items-start gap-1 p-4 rounded-[1.5rem] bg-card shadow-elevated border border-border"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-1">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-extrabold text-foreground">Adicionar por foto</p>
          <p className="text-xs text-muted-foreground">Tire uma foto</p>
        </motion.button>
      </div>

      {/* Today's food list */}
      <div className="px-5 mt-5">
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
                <button
                  onClick={() => { deleteEntry(entry.id); refresh(); }}
                  className="p-2 rounded-xl hover:bg-destructive/10 transition-colors flex-shrink-0"
                  aria-label="Remover alimento"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
