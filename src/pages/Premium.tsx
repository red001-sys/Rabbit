import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { setPremium } from '@/lib/storage';
import RabbitMascot from '@/components/RabbitMascot';

const Premium = () => {
  const navigate = useNavigate();

  const handleActivate = () => {
    setPremium(true);
    navigate('/');
  };

  const features = [
    'Sem anúncios',
    'Histórico completo de 30 dias',
    'Detalhes nutricionais avançados',
  ];

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-8 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-accent hover:bg-accent/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-accent-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Premium ⭐</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <RabbitMascot message="Desbloqueie tudo! 🌟" size={90} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 w-full max-w-sm"
        >
          <div className="bg-card rounded-2xl p-6 shadow-card border border-primary/20">
            <h2 className="text-2xl font-black text-foreground mb-1">Premium</h2>
            <p className="text-muted-foreground text-sm mb-6">Aproveite ao máximo seu controle de calorias</p>

            <div className="space-y-3 mb-6 text-left">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleActivate}
              className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base"
            >
              Ativar Premium (Demo)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Versão demonstrativa gratuita</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;
