import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Zap, Loader2, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const comprarPlano = async (plan: 'mensal' | 'anual') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Não foi possível iniciar o checkout');
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Sem anúncios',
    'Histórico completo de 30 dias',
    'Detalhes nutricionais avançados',
  ];

  const plans = {
    monthly: {
      label: 'Mensal',
      price: 'R$ 19,90',
      period: '/mês',
      totalYear: 'R$ 238,80/ano',
    },
    annual: {
      label: 'Anual',
      price: 'R$ 2,49',
      period: '/mês',
      subtitle: '12x de R$ 2,49 ou R$ 29,90 à vista',
      totalYear: 'R$ 29,90/ano',
      savings: 'Economia de R$ 208,90 por ano',
    },
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-8 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-accent hover:bg-accent/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-accent-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Premium ⭐</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg"
        >
          <Crown className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 w-full max-w-sm"
        >
          {/* Features */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-primary/20 mb-4">
            <h2 className="text-2xl font-black text-foreground mb-1">Premium</h2>
            <p className="text-muted-foreground text-sm mb-5">Aproveite ao máximo seu controle de calorias</p>
            <div className="space-y-3 text-left">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Monthly */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <p className="text-xs font-bold text-muted-foreground mb-1">{plans.monthly.label}</p>
              <p className="text-xl font-black text-foreground">{plans.monthly.price}</p>
              <p className="text-xs text-muted-foreground">{plans.monthly.period}</p>
            </button>

            {/* Annual */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === 'annual'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <Badge className="absolute -top-2.5 right-2 bg-destructive text-destructive-foreground text-[10px] font-black px-2 py-0.5">
                90% OFF
              </Badge>
              <p className="text-xs font-bold text-muted-foreground mb-1">{plans.annual.label}</p>
              <p className="text-xl font-black text-foreground">{plans.annual.price}</p>
              <p className="text-xs text-muted-foreground">{plans.annual.period}</p>
            </button>
          </div>

          {/* Plan details */}
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-card border border-border mb-4"
          >
            {selectedPlan === 'annual' ? (
              <div className="space-y-1.5 text-center">
                <p className="text-sm font-bold text-foreground">{plans.annual.subtitle}</p>
                <p className="text-xs text-muted-foreground line-through">Mensal: {plans.monthly.totalYear}</p>
                <p className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {plans.annual.savings}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{plans.monthly.price} cobrado mensalmente</p>
                <p className="text-xs text-muted-foreground mt-1">Total: {plans.monthly.totalYear}</p>
              </div>
            )}
          </motion.div>

          <Button
            onClick={() => comprarPlano(selectedPlan === 'annual' ? 'anual' : 'mensal')}
            disabled={loading}
            className="w-full h-12 gradient-primary text-primary-foreground font-bold text-base"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assinar Premium'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Pagamento seguro via Stripe</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;
