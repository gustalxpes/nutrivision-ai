import { supabase } from './supabase';

export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password', // Assuming we might want a specific page later, or just home
    });
    return { error };
};
