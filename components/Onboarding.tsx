import React, { useState } from 'react';
import { Target, ArrowRight, Activity, Flame, Zap, Droplet } from 'lucide-react';
import { MacroGoals } from '../types';

interface OnboardingProps {
    onSave: (goals: MacroGoals) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onSave }) => {
    const [goals, setGoals] = useState<MacroGoals>({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 70
    });

    const [step, setStep] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(goals);
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-secondary mb-6 shadow-xl shadow-emerald-500/20 animate-float">
                        <Target size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Vamos definir suas metas!</h1>
                    <p className="text-textMuted text-lg">
                        Para personalizar sua experiência, precisamos saber quais são seus objetivos diários.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-md">

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-white font-medium">
                                <Flame className="text-primary" size={20} /> Metas Diárias de Calorias
                            </label>
                            <input
                                type="number"
                                min="500"
                                value={goals.calories}
                                onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                                className="w-full bg-surfaceHighlight border border-white/10 text-white p-4 rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-center"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="flex flex-col items-center gap-2 text-textMuted text-sm font-medium">
                                    <Zap className="text-emerald-400" size={18} /> Proteínas (g)
                                </label>
                                <input
                                    type="number"
                                    value={goals.protein}
                                    onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                                    className="w-full bg-surfaceHighlight border border-white/10 text-white p-3 rounded-xl text-center font-bold focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex flex-col items-center gap-2 text-textMuted text-sm font-medium">
                                    <Activity className="text-blue-400" size={18} /> Carbs (g)
                                </label>
                                <input
                                    type="number"
                                    value={goals.carbs}
                                    onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                                    className="w-full bg-surfaceHighlight border border-white/10 text-white p-3 rounded-xl text-center font-bold focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex flex-col items-center gap-2 text-textMuted text-sm font-medium">
                                    <Droplet className="text-yellow-400" size={18} /> Gorduras (g)
                                </label>
                                <input
                                    type="number"
                                    value={goals.fat}
                                    onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                                    className="w-full bg-surfaceHighlight border border-white/10 text-white p-3 rounded-xl text-center font-bold focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-8 bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                    >
                        Começar Jornada <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};
