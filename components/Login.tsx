import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';
import { sendPasswordResetEmail } from '../services/authService';

interface LoginProps {
    onLogin: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<AuthMode>('login');

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (mode === 'forgot-password') {
                if (!email) {
                    throw new Error('Por favor, informe seu email.');
                }
                const { error: resetError } = await sendPasswordResetEmail(email);
                if (resetError) throw resetError;
                setSuccessMessage('Email de redefinição enviado! Verifique sua caixa de entrada.');
                setIsLoading(false);
                return;
            }

            // Basic Validation
            if (!email || !password) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.');
            }

            if (mode === 'register') {
                if (!name) {
                    throw new Error('Por favor, informe seu nome.');
                }
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });

                if (signUpError) throw signUpError;

                if (data.user && !data.session) {
                    setSuccessMessage('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta antes de entrar.');
                    setIsLoading(false);
                    return;
                }

                onLogin();
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                onLogin();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(prev => {
            if (prev === 'login') return 'register';
            return 'login';
        });
        setError('');
        setSuccessMessage('');
    };

    const switchToLogin = () => {
        setMode('login');
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl animate-fade-in transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary mb-4 shadow-lg shadow-emerald-500/20">
                        <span className="text-3xl font-bold text-white">N+</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">
                        {mode === 'login' && 'Bem-vindo de volta!'}
                        {mode === 'register' && 'Crie sua conta'}
                        {mode === 'forgot-password' && 'Recuperar Senha'}
                    </h1>
                    <p className="text-textMuted">
                        {mode === 'login' && 'Acesse sua conta para continuar sua jornada'}
                        {mode === 'register' && 'Comece sua transformação hoje mesmo'}
                        {mode === 'forgot-password' && 'Informe seu email para receber o link'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name Field - Only for Register */}
                    {mode === 'register' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-textMuted ml-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-surfaceHighlight border border-white/5 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-textMuted ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surfaceHighlight border border-white/5 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    {mode !== 'forgot-password' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-textMuted ml-1">Senha</label>
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot-password')}
                                        className="text-xs text-primary hover:text-primaryHover transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surfaceHighlight border border-white/5 text-white pl-12 pr-12 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirm Password Field - Only for Register */}
                    {mode === 'register' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="text-sm font-medium text-textMuted ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-surfaceHighlight border border-white/5 text-white pl-12 pr-12 py-4 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-white/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center animate-fade-in">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {mode === 'login' && (
                                    <>
                                        Entrar
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                                {mode === 'register' && (
                                    <>
                                        Me Cadastrar
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                                {mode === 'forgot-password' && 'Enviar Link'}
                            </>
                        )}
                    </button>

                    {mode === 'forgot-password' && (
                        <button
                            type="button"
                            onClick={switchToLogin}
                            className="w-full text-textMuted hover:text-white transition-colors text-sm py-2 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft size={16} /> Voltar para o login
                        </button>
                    )}
                </form>

                {mode !== 'forgot-password' && (
                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <p className="text-textMuted text-sm">
                            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                            <button
                                onClick={toggleMode}
                                className="text-primary hover:text-primaryHover font-medium hover:underline transition-colors"
                            >
                                {mode === 'login' ? 'Cadastre-se gratuitamente' : 'Entrar'}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <p className="absolute bottom-6 text-white/10 text-xs text-center"><span className="text-white/20">Nutri<span className="text-primary/40">+</span> AI</span> © 2025</p>
        </div>
    );
};

