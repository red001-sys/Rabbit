import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RabbitMascot from '@/components/RabbitMascot';
import { calculateDailyCalories } from '@/lib/calories';
import { saveProfile } from '@/lib/storage';
import { UserProfile } from '@/types';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const mascotMessages = [
    'Olá! Qual é o seu nome? 🐰',
    `Prazer, ${name}! Me conta um pouco sobre você.`,
    'Quase lá! Vou calcular sua meta diária!',
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return gender !== '' && parseInt(age) > 0 && parseInt(age) < 120;
      case 2: return parseInt(height) > 50 && parseInt(height) < 300 && parseInt(weight) > 10 && parseInt(weight) < 500;
      default: return false;
    }
  };

  const handleFinish = () => {
    const g = gender as 'male' | 'female';
    const dailyCalorieGoal = calculateDailyCalories(g, parseInt(age), parseInt(height), parseInt(weight));
    const profile: UserProfile = {
      name: name.trim(),
      gender: g,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      dailyCalorieGoal,
    };
    saveProfile(profile);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <RabbitMascot message={mascotMessages[step]} size={100} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-sm mt-8 space-y-4"
        >
          {step === 0 && (
            <div className="space-y-3">
              <Label className="text-base font-bold">Seu nome</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Digite seu nome..."
                className="text-lg h-12"
                maxLength={50}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-bold">Gênero</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    variant={gender === 'male' ? 'default' : 'outline'}
                    className="flex-1 h-12 text-base"
                    onClick={() => setGender('male')}
                  >
                    Masculino
                  </Button>
                  <Button
                    variant={gender === 'female' ? 'default' : 'outline'}
                    className="flex-1 h-12 text-base"
                    onClick={() => setGender('female')}
                  >
                    Feminino
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-base font-bold">Idade</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Ex: 25"
                  className="h-12 text-lg"
                  min={1}
                  max={120}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-bold">Altura (cm)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="Ex: 170"
                  className="h-12 text-lg"
                  min={50}
                  max={300}
                />
              </div>
              <div>
                <Label className="text-base font-bold">Peso (kg)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="Ex: 70"
                  className="h-12 text-lg"
                  min={10}
                  max={500}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-sm mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(s => s - 1)}>
            Voltar
          </Button>
        )}
        <Button
          className="flex-1 h-12 gradient-primary text-primary-foreground font-bold text-base"
          disabled={!canProceed()}
          onClick={() => {
            if (step < 2) setStep(s => s + 1);
            else handleFinish();
          }}
        >
          {step < 2 ? 'Continuar' : 'Começar! 🎉'}
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
