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
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-xl font-bold text-foreground">{profile.name} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/history')}
            className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
          >
            <Clock className="w-5 h-5 text-accent-foreground" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
          >
            <Settings className="w-5 h-5 text-accent-foreground" />
          </button>
        </div>
      </div>

      {/* Main calorie circle */}
      <div className="flex justify-center mt-4">
        <CircleProgress
          value={totals.calories}
          max={profile.dailyCalorieGoal}
          size={180}
          strokeWidth={14}
          color="hsl(var(--primary))"
          label="Calorias"
          unit="kcal"
        />
      </div>

      {/* Macro circles */}
      <div className="flex justify-center gap-8 mt-8">
        <CircleProgress
          value={totals.protein}
          max={goals.protein}
          size={80}
          strokeWidth={6}
          color="hsl(var(--protein))"
          label="Proteína"
          icon={<SteakIcon size={18} className="text-protein" />}
          unit="g"
          onClick={() => setBalloon('protein')}
        />
        <CircleProgress
          value={totals.fat}
          max={goals.fat}
          size={80}
          strokeWidth={6}
          color="hsl(var(--fat))"
          label="Gordura"
          icon={<OilDropIcon size={18} className="text-fat" />}
          unit="g"
          onClick={() => setBalloon('fat')}
        />
        <CircleProgress
          value={totals.sugar}
          max={goals.sugar}
          size={80}
          strokeWidth={6}
          color="hsl(var(--sugar))"
          label="Açúcar"
          icon={<SugarCubesIcon size={18} className="text-sugar" />}
          unit="g"
          onClick={() => setBalloon('sugar')}
        />
      </div>

      {/* Add food buttons */}
      <div className="flex justify-center gap-3 mt-8 px-5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-soft"
        >
          <PenLine className="w-4 h-4" />
          Adicionar por texto
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEntryMode('photo'); setShowFoodEntry(true); }}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-card"
        >
          <Camera className="w-4 h-4" />
          Adicionar por foto
        </motion.button>
      </div>

      {/* Today's food list */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Hoje</h2>
          <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
            <Clock className="w-3.5 h-3.5" /> Histórico
          </button>
        </div>
        {todayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum alimento registrado.</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border"
              >
                <div>
                  <p className="text-sm font-bold text-foreground capitalize">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.quantity}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{entry.nutrients.calories} kcal</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Add food (bottom left) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEntryMode('text'); setShowFoodEntry(true); }}
        className="fixed bottom-6 left-5 w-14 h-14 rounded-full gradient-primary shadow-soft flex items-center justify-center z-30"
      >
        <Plus className="w-7 h-7 text-primary-foreground" />
      </motion.button>

      {/* FAB - Detail (bottom right) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDetail(true)}
        className="fixed bottom-6 right-5 w-12 h-12 rounded-full bg-accent shadow-card flex items-center justify-center z-30"
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
