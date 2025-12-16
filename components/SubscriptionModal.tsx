import React, { useState } from 'react';
import { CheckCircle, Star, Shield, Zap, X } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubscribe = async () => {
        setIsLoading(true);
        // Simulator: In a real app, this would redirect to Stripe/Apple Pay
        // Here we just simulate a successful database update
        try {
            const { error } = await supabase.auth.updateUser({
                data: { subscription_status: 'active' }
            });

            if (error) throw error;

            // Artificial delay to simulate processing
            setTimeout(() => {
                onSubscribe();
                setIsLoading(false);
                onClose();
            }, 1500);

        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-surface w-full max-w-lg rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden">
                {/* Close Button (Optional: Remove if you want to force choice) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
                >
                    <X size={20} className="text-white/50 hover:text-white" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-8 text-center relative">
                    <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-primary/30 rounded-full blur-[80px]" />
                    <Star size={48} className="text-yellow-400 mx-auto mb-4 drop-shadow-glow animate-bounce-slow" fill="currentColor" />
                    <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Desbloqueie o Nutri+ Pro</h2>
                    <p className="text-white/70 relative z-10">Seu período de teste gratuito acabou. Assine para continuar transformando sua saúde.</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Benefits */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-white text-sm">Scanner de Alimentos por IA ilimitado</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-white text-sm">Receitas fitness personalizadas</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                            <span className="text-white text-sm">Acompanhamento de metas avançado</span>
                        </div>
                    </div>

                    {/* Plans */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSelectedPlan('monthly')}
                            className={`p-4 rounded-xl border-2 transition-all text-left relative ${selectedPlan === 'monthly'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="text-sm text-textMuted mb-1">Mensal</div>
                            <div className="text-2xl font-bold text-white">R$ 29,90</div>
                            <div className="text-xs text-white/50">Cobrado mensalmente</div>
                        </button>

                        <button
                            onClick={() => setSelectedPlan('yearly')}
                            className={`p-4 rounded-xl border-2 transition-all text-left relative ${selectedPlan === 'yearly'
                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="absolute -top-3 right-4 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ECONOMIZE 40%
                            </div>
                            <div className="text-sm text-textMuted mb-1">Anual</div>
                            <div className="text-2xl font-bold text-white">R$ 17,90</div>
                            <div className="text-xs text-white/50">Por mês, cobrado anualmente</div>
                        </button>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-emerald-500 hover:from-primaryHover hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap size={20} fill="currentColor" />
                                Assinar Agora
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-white/30">
                        Pagamento seguro via Stripe/Apple Pay. Cancele a qualquer momento.
                    </p>
                </div>
            </div>
        </div>
    );
};
