import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Clock } from 'lucide-react';
import CircleProgress from '@/components/CircleProgress';
import RabbitMascot from '@/components/RabbitMascot';
import FoodEntryDialog from '@/components/FoodEntryDialog';
import FoodDetailSheet from '@/components/FoodDetailSheet';
import SettingsDialog from '@/components/SettingsDialog';
import AdDialog from '@/components/AdDialog';
import InfoBalloon from '@/components/InfoBalloon';
import { getProfile, getTodayTotals } from '@/lib/storage';
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

  const totals = getTodayTotals();
  const goals = calculateDailyMacroGoals(profile.dailyCalorieGoal);

  const balloonData: Record<string, { title: string; description: string; color: string }> = {
    protein: {
      title: '🥩 Proteína',
      description: 'Essencial para construção muscular e recuperação. Presente em carnes, ovos, leguminosas e laticínios.',
      color: 'hsl(var(--protein))',
    },
    carbs: {
      title: '🍞 Carboidratos',
      description: 'Principal fonte de energia do corpo. Encontrado em arroz, pão, massas, frutas e tubérculos.',
      color: 'hsl(var(--carbs))',
    },
    sugar: {
      title: '🧊 Açúcar',
      description: 'Tipo de carboidrato simples. Consumo excessivo está ligado a problemas de saúde. Modere doces e bebidas açucaradas.',
      color: 'hsl(var(--sugar))',
    },
  };

  const getMascotMessage = () => {
    const pct = totals.calories / profile.dailyCalorieGoal;
    if (pct === 0) return 'Bora registrar o primeiro alimento! 🥕';
    if (pct < 0.5) return 'Bom começo! Continue assim! 💪';
    if (pct < 0.9) return 'Quase na meta! 🎯';
    if (pct <= 1) return 'Meta atingida! Parabéns! 🎉';
    return 'Ops, passou da meta! Cuidado! 😅';
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

      {/* Mascot */}
      <div className="flex justify-center mt-2 mb-4">
        <RabbitMascot message={getMascotMessage()} size={70} />
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
          icon="🥩"
          unit="g"
          onClick={() => setBalloon('protein')}
        />
        <CircleProgress
          value={totals.carbs}
          max={goals.carbs}
          size={80}
          strokeWidth={6}
          color="hsl(var(--carbs))"
          label="Carbos"
          icon="🍞"
          unit="g"
          onClick={() => setBalloon('carbs')}
        />
        <CircleProgress
          value={totals.sugar}
          max={goals.sugar}
          size={80}
          strokeWidth={6}
          color="hsl(var(--sugar))"
          label="Açúcar"
          icon="🧊"
          unit="g"
          onClick={() => setBalloon('sugar')}
        />
      </div>

      {/* Meta info */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Meta diária: <span className="font-bold text-foreground">{profile.dailyCalorieGoal} kcal</span>
        </p>
      </div>

      {/* FAB - Add food */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFoodEntry(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full gradient-primary shadow-soft flex items-center justify-center z-30"
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
