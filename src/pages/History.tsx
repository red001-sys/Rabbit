import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEntriesForWeek, getProfile, isPremium, getEntries } from '@/lib/storage';
import { FoodEntry } from '@/types';

const History = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const premium = isPremium();

  const groupedEntries = useMemo(() => {
    const entries = premium
      ? getEntries().filter(e => {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return new Date(e.date) >= monthAgo;
        })
      : getEntriesForWeek();

    const groups: Record<string, FoodEntry[]> = {};
    entries.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a));
  }, [premium]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-accent hover:bg-accent/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-accent-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Histórico</h1>
        {!premium && (
          <span className="ml-auto text-xs bg-accent px-2.5 py-1 rounded-full font-semibold text-muted-foreground">
            7 dias
          </span>
        )}
        {premium && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
            ⭐ 30 dias
          </span>
        )}
      </div>

      {!premium && (
        <button
          onClick={() => navigate('/premium')}
          className="w-full mb-4 p-3 bg-accent rounded-xl text-center"
        >
          <p className="text-sm font-bold text-foreground">⭐ Seja Premium!</p>
          <p className="text-xs text-muted-foreground">Histórico completo de 30 dias</p>
        </button>
      )}

      {groupedEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🥕</p>
          <p className="text-muted-foreground font-semibold">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedEntries.map(([date, entries]) => {
            const dayCalories = entries.reduce((s, e) => s + e.nutrients.calories, 0);
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground">{formatDate(date)}</h3>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {dayCalories} / {profile?.dailyCalorieGoal} kcal
                  </span>
                </div>
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground capitalize">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{entry.nutrients.calories} kcal</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
