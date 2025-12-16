import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { sendPasswordResetEmail } from '../services/authService';
import { MacroGoals } from '../types';
import { Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface SettingsProps {
    goals: MacroGoals;
    onUpdateGoals: (newGoals: MacroGoals) => void;
    userEmail?: string;
}

export const Settings: React.FC<SettingsProps> = ({ goals, onUpdateGoals, userEmail }) => {
    // Goals State
    const [tempGoals, setTempGoals] = useState<MacroGoals>(goals);

    // Sync state when props change (crucial for async data loading)
    React.useEffect(() => {
        setTempGoals(goals);
    }, [goals]);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(0);

    const handleUpdateGoals = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateGoals(tempGoals);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ text: 'Preencha todos os campos.', type: 'error' });
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'A nova senha não confere.', type: 'error' });
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ text: 'A nova senha deve ter no mínimo 6 caracteres.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            if (!userEmail) throw new Error('Email do usuário não encontrado.');

            // Verify current password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: currentPassword,
            });

            if (signInError) {
                setFailedAttempts(prev => prev + 1);
                throw new Error('Senha atual incorreta.');
            }

            // Update Password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setFailedAttempts(0);

        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || 'Erro ao alterar senha.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!userEmail) return;
        setIsLoading(true);
        const { error } = await sendPasswordResetEmail(userEmail);
        setIsLoading(false);
        if (error) {
            setMessage({ text: 'Erro ao enviar email.', type: 'error' });
        } else {
            setMessage({ text: 'Email de redefinição enviado! Verifique sua caixa de entrada.', type: 'success' });
            setFailedAttempts(0); // Reset attempts after sending email
        }
    };

    return (
        <div className="max-w-xl mx-auto w-full space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white text-center">Configurações</h2>

            {/* Goals Section */}
            <form onSubmit={handleUpdateGoals} className="bg-surface p-8 rounded-2xl border border-white/5 space-y-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2">Metas Diárias</h3>

                <div>
                    <label className="block text-textMuted text-sm mb-2">Meta de Calorias (kcal)</label>
                    <input
                        type="number"
                        value={tempGoals.calories}
                        onChange={e => setTempGoals({ ...tempGoals, calories: Number(e.target.value) })}
                        className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-textMuted text-sm mb-2">Proteínas (g)</label>
                        <input
                            type="number"
                            value={tempGoals.protein}
                            onChange={e => setTempGoals({ ...tempGoals, protein: Number(e.target.value) })}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted text-sm mb-2">Carbs (g)</label>
                        <input
                            type="number"
                            value={tempGoals.carbs}
                            onChange={e => setTempGoals({ ...tempGoals, carbs: Number(e.target.value) })}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted text-sm mb-2">Gorduras (g)</label>
                        <input
                            type="number"
                            value={tempGoals.fat}
                            onChange={e => setTempGoals({ ...tempGoals, fat: Number(e.target.value) })}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Salvar Metas
                </button>
            </form>

            {/* Change Password Section */}
            <form onSubmit={handleChangePassword} className="bg-surface p-8 rounded-2xl border border-white/5 space-y-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                    <Lock size={20} /> Alterar Senha
                </h3>

                {message && (
                    <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative group">
                        <label className="block text-textMuted text-sm mb-2">Senha Atual</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-textMuted hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {failedAttempts >= 3 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex flex-col items-center gap-2 animate-fade-in">
                            <span className="text-yellow-400 text-sm font-medium flex items-center gap-2">
                                <AlertCircle size={16} /> Parece que você esqueceu sua senha.
                            </span>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-primary hover:text-primaryHover hover:underline text-sm font-bold"
                            >
                                Enviar email de redefinição
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-textMuted text-sm mb-2">Nova Senha</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted text-sm mb-2">Confirmar Nova Senha</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-background border border-gray-700 text-white p-3 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-surfaceHighlight hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Atualizar Senha'}
                </button>
            </form>
        </div>
    );
};
