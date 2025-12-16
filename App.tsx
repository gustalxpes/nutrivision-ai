import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Scan, UtensilsCrossed, History, Settings as SettingsIcon, LogOut, Menu, X, Calendar, Edit2, Check, CheckCircle, BookHeart, Clock, Gauge, Flame, ChefHat, ChevronLeft, ChevronRight, AlertCircle, Trash2, Heart, PlusCircle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { FoodAnalyzer } from './components/FoodAnalyzer';
import { RecipeFinder, RecipeDetailModal } from './components/RecipeFinder';
import { Login } from './components/Login';
import { ResetPassword } from './components/ResetPassword';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { SubscriptionModal } from './components/SubscriptionModal';
import { supabase } from './services/supabase';
import { MacroGoals, Meal, ViewState, AnalysisResult, Recipe } from './types';

// Constants
const DEFAULT_GOALS: MacroGoals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};

// Toast Component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in ${bgColors[type]} text-white`}>
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      {type === 'info' && <CheckCircle size={20} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}> = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-primary text-white shadow-lg shadow-emerald-900/20'
      : 'text-textMuted hover:bg-surfaceHighlight hover:text-white'
      }`}
  >
    <div className={active ? 'text-white' : ''}>{icon}</div>
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

// Component for Meal Details Modal
const MealDetailModal: React.FC<{ meal: Meal; onClose: () => void; onDelete: (id: string) => void }> = ({ meal, onClose, onDelete }) => {
  if (!meal) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh]"
      >
        {/* Fixed Image Header */}
        <div className="h-48 bg-black w-full relative shrink-0">
          {meal.imageUrl ? (
            <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-textMuted bg-surfaceHighlight">Sem imagem</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20 backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{meal.name}</h2>
              <div className="flex items-center gap-2 text-textMuted text-xs">
                <Calendar size={12} />
                {new Date(meal.timestamp).toLocaleString('pt-BR')}
                {meal.portion && <span>• {meal.portion}</span>}
              </div>
            </div>
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold text-base whitespace-nowrap">
              {meal.calories} kcal
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
              <div className="text-emerald-400 font-bold text-lg">{meal.protein}g</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Prot</div>
            </div>
            <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
              <div className="text-blue-400 font-bold text-lg">{meal.carbs}g</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Carb</div>
            </div>
            <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
              <div className="text-yellow-400 font-bold text-lg">{meal.fat}g</div>
              <div className="text-[10px] text-textMuted uppercase tracking-wider">Gord</div>
            </div>
          </div>

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Ingredientes Detectados</h3>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2 py-1 bg-surfaceHighlight rounded-md text-xs text-gray-300 border border-white/5">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Delete Button */}
        <div className="p-4 border-t border-white/10 bg-surfaceHighlight/10 flex justify-end shrink-0">
          <button
            onClick={() => onDelete(meal.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={16} /> Remover Refeição
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // State
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedSavedRecipe, setSelectedSavedRecipe] = useState<Recipe | null>(null);

  // Settings Form State
  const [tempGoals, setTempGoals] = useState<MacroGoals>(DEFAULT_GOALS);

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // History Date State
  const [historyDate, setHistoryDate] = useState<Date>(new Date());

  // Subscription State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);

  // Helper Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Helper: Check for write-lock
  const checkWriteLock = () => {
    if (isLocked) {
      setShowSubscriptionModal(true);
      return true; // Locked
    }
    return false; // Available
  };

  // Helper: Calculate Trial Sync and Lock Status
  const syncSubscriptionStatus = (user: any) => {
    // 1. Check if ACTIVE/PAID
    const status = user.user_metadata?.subscription_status;
    if (status === 'active') {
      setIsLocked(false);
      setTrialDaysLeft(0); // Not relevant
      return;
    }

    // 2. Check Trial (Created At)
    const createdAt = new Date(user.created_at || new Date());
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const MAX_TRIAL_DAYS = 3;
    const remaining = Math.max(0, MAX_TRIAL_DAYS - diffDays);

    setTrialDaysLeft(remaining);

    // If Trial Expired AND not active => LOCK
    if (diffDays > MAX_TRIAL_DAYS) {
      setIsLocked(true);
      // Optional: Auto-show modal on login if locked?
      // setShowSubscriptionModal(true); 
    } else {
      setIsLocked(false);
    }
  };

  const handleSubscribeSuccess = async () => {
    // Refresh session logic to pull new metadata
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session?.user) {
      // Optimistically unlock
      setIsLocked(false);
      setSession(session);
      showToast("Assinatura confirmada! Obrigado por ser Pro.", "success");
    }
  };

  // Load Data
  const loadData = async (userId: string) => {
    try {
      // 1. Load Profile (Goals)
      const { data: profile } = await supabase
        .from('profiles')
        .select('goals')
        .eq('id', userId)
        .single();

      if (profile && profile.goals) {
        setGoals(profile.goals);
        setTempGoals(profile.goals);

        // Check for first-time user (heuristic: calories = 0)
        if (profile.goals.calories === 0) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      }

      // 2. Load Meals
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId);

      if (mealsData) {
        const formattedMeals: Meal[] = mealsData.map((m: any) => ({
          id: m.id,
          name: m.name,
          timestamp: m.timestamp,
          calories: Number(m.calories),
          protein: Number(m.protein),
          carbs: Number(m.carbs),
          fat: Number(m.fat),
          portion: m.portion,
          imageUrl: m.image_url,
          ingredients: m.ingredients
        }));
        setMeals(formattedMeals);
      }

      // 3. Load Saved Recipes
      const { data: recipesData } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId);

      if (recipesData) {
        const formattedRecipes: Recipe[] = recipesData.map((r: any) => ({
          name: r.name,
          description: r.description,
          timeToCook: r.time_to_cook,
          difficulty: r.difficulty,
          calories: Number(r.calories),
          protein: Number(r.protein),
          carbs: Number(r.carbs),
          fat: Number(r.fat),
          ingredients: r.ingredients,
          instructions: r.instructions
        }));
        setSavedRecipes(formattedRecipes);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Erro ao carregar dados.", "error");
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        if (session.user.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name.split(' ')[0]); // Use first name
        }
        syncSubscriptionStatus(session.user);
        loadData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {

      if (event === 'PASSWORD_RECOVERY') {
        setView(ViewState.RESET_PASSWORD);
        return;
      }

      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        if (session.user.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name.split(' ')[0]);
        }
        syncSubscriptionStatus(session.user);
        loadData(session.user.id);

        // Only switch to dashboard if we are not in reset password mode
        // If we just logged in normally, go to dashboard.
        // We know we just logged in if event is SIGNED_IN
        if (event === 'SIGNED_IN') {
          // Check if we are coming from a reset password flow (maybe handle that in a more robust way?)
          // For now, default behavior is fine.
          // If we were in RESET_PASSWORD view, we might want to stay there?
          // Actually, if we are authenticated, we usually show dashboard.
          // BUT, for password reset, the user is signed in automatically when they click the link!
          // So we need to be careful not to redirect them to dashboard immediately if the URL has type=recovery.
          // However, Supabase sends PASSWORD_RECOVERY event.
        }

      } else {
        // Clear data on logout
        setMeals([]);
        setGoals(DEFAULT_GOALS);
        setSavedRecipes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView(ViewState.DASHBOARD);
    setMobileMenuOpen(false);
  };

  // Handlers
  const handleAddMeal = async (result: AnalysisResult, imageUrl: string) => {
    const newMeal: Meal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Safe ID for non-secure context
      timestamp: new Date().toISOString(),
      name: result.foodName,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      portion: result.portion,
      imageUrl,
      ingredients: result.ingredients
    };

    // Optimistic Update
    setMeals(prev => [...prev, newMeal]);
    setView(ViewState.DASHBOARD);
    showToast("Refeição adicionada com sucesso!");

    // Backend Save
    if (session?.user) {
      // We insert without ID to let Supabase generate one (or use ours if we changed DB to allow it, but standard is default gen)
      // Actually, for easy deletion, it's better if we know the ID.
      // The SQL I provided: id uuid default uuid_generate_v4() primary key.
      // We can actually Pass UUID if we want? Yes standard postgres allows it.
      const { error } = await supabase.from('meals').insert({
        id: newMeal.id,
        user_id: session.user.id,
        name: newMeal.name,
        timestamp: newMeal.timestamp,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        portion: newMeal.portion,
        image_url: newMeal.imageUrl,
        ingredients: newMeal.ingredients
      });
      if (error) console.error("Error saving meal:", error);
    }
  };

  const handleAddRecipeToDiet = async (recipe: Recipe) => {
    const newMeal: Meal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Safe ID for non-secure context
      timestamp: new Date().toISOString(),
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      portion: '1 porção',
      ingredients: recipe.ingredients,
    };

    // Optimistic Update
    setMeals(prev => [...prev, newMeal]);
    setView(ViewState.DASHBOARD);
    showToast("Receita adicionada à dieta!");

    // Backend Save
    if (session?.user) {
      const { error } = await supabase.from('meals').insert({
        id: newMeal.id,
        user_id: session.user.id,
        name: newMeal.name,
        timestamp: newMeal.timestamp,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        portion: newMeal.portion,
        image_url: undefined,
        ingredients: newMeal.ingredients
      });
      if (error) console.error("Error saving recipe meal:", error);
    }
  };

  const handleUpdateGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoals(tempGoals);
    showToast("Metas atualizadas com sucesso!");

    if (session?.user) {
      await supabase.from('profiles').update({ goals: tempGoals }).eq('id', session.user.id);
    }
  };

  const handleOnboardingSave = async (newGoals: MacroGoals) => {
    // Check Lock
    if (checkWriteLock()) return;

    setGoals(newGoals);
    setShowOnboarding(false);

    // Save to Profile
    const { error } = await supabase
      .from('profiles')
      .update({ goals: newGoals })
      .eq('id', session.user.id);

    if (error) {
      console.error("Error updating goals:", error);
      showToast("Erro ao salvar metas.", "error");
    } else {
      showToast("Metas atualizadas!");
      // Onboarding is handled by state boolean, so just closing it is enough
    }
  };

  const handleDeleteMeal = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optional: Allow deletion even if locked? Or block?
    // Let's block to force decision, or allow cleanup?
    // Usually Read-Only allows deletion. Let's allow it for now.

    // Optimistic UI
    const previousMeals = [...meals];
    setMeals(meals.filter(m => m.id !== id));
    if (selectedMeal?.id === id) setSelectedMeal(null);

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting meal:", error);
      showToast("Erro ao apagar refeição.", "error");
      setMeals(previousMeals);
    } else {
      showToast("Refeição removida.");
    }
  };

  const handleToggleSaveRecipe = async (recipe: Recipe) => {
    // Check Lock
    if (checkWriteLock()) return;

    const isSaved = savedRecipes.some(r => r.name === recipe.name);

    if (isSaved) {
      // Remove
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', session.user.id)
        .eq('name', recipe.name); // basic match

      if (!error) {
        setSavedRecipes(savedRecipes.filter(r => r.name !== recipe.name));
        showToast("Receita removida dos favoritos.");
      }
    } else {
      // Add
      const { error } = await supabase
        .from('saved_recipes')
        .insert([{
          user_id: session.user.id,
          name: recipe.name,
          description: recipe.description,
          time_to_cook: recipe.timeToCook,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions
        }]);

      if (!error) {
        setSavedRecipes([...savedRecipes, recipe]);
        showToast("Receita salva com sucesso!");
      }
    }
  };
  const changeHistoryDate = (days: number) => {
    const newDate = new Date(historyDate);
    newDate.setDate(newDate.getDate() + days);
    setHistoryDate(newDate);
  };

  // Helper to filter meals by history date
  const getMealsForHistoryDate = () => {
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return (
        mealDate.getDate() === historyDate.getDate() &&
        mealDate.getMonth() === historyDate.getMonth() &&
        mealDate.getFullYear() === historyDate.getFullYear()
      );
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const NavContent = ({ collapsed = false }) => (
    <>
      <div className={`flex items-center gap-3 px-4 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          N+
        </div>
        {!collapsed && <span className="text-xl font-bold text-white tracking-tight">Nutri<span className="text-primary">+</span></span>}
      </div>

      <div className="space-y-2 flex-1">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Controle da Dieta"
          active={view === ViewState.DASHBOARD}
          onClick={() => { setView(ViewState.DASHBOARD); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<Scan size={20} />}
          label="Scanner IA"
          active={view === ViewState.SCAN_FOOD}
          onClick={() => { setView(ViewState.SCAN_FOOD); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<UtensilsCrossed size={20} />}
          label="Receitas Fitness"
          active={view === ViewState.RECIPES}
          onClick={() => { setView(ViewState.RECIPES); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<BookHeart size={20} />}
          label="Receitas Salvas"
          active={view === ViewState.SAVED_RECIPES}
          onClick={() => { setView(ViewState.SAVED_RECIPES); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<History size={20} />}
          label="Histórico"
          active={view === ViewState.HISTORY}
          onClick={() => { setView(ViewState.HISTORY); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<SettingsIcon size={20} />}
          label="Metas e Config"
          active={view === ViewState.SETTINGS}
          onClick={() => { setView(ViewState.SETTINGS); setMobileMenuOpen(false); }}
          collapsed={collapsed}
        />
      </div>

      <div className="mt-auto">
        <SidebarItem
          icon={<LogOut size={20} />}
          label="Sair"
          active={false}
          onClick={handleLogout}
          collapsed={collapsed}
        />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden">
      {!isAuthenticated && view !== ViewState.RESET_PASSWORD ? (
        <Login onLogin={handleLogin} />
      ) : view === ViewState.RESET_PASSWORD ? (
        <ResetPassword onSuccess={() => setView(ViewState.DASHBOARD)} />
      ) : (
        <>
          {/* Toast Notification */}
          {showOnboarding && <Onboarding onSave={handleOnboardingSave} />}

          {toast && (
            <ToastNotification
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* Detail Modal for Meals */}
          {selectedMeal && (
            <MealDetailModal
              meal={selectedMeal}
              onClose={() => setSelectedMeal(null)}
              onDelete={(id) => handleDeleteMeal(id)}
            />
          )}

          {/* Detail Modal for Saved Recipes in Saved View */}
          {selectedSavedRecipe && (
            <RecipeDetailModal
              recipe={selectedSavedRecipe}
              onClose={() => setSelectedSavedRecipe(null)}
              onToggleSave={handleToggleSaveRecipe}
              onAddToDiet={handleAddRecipeToDiet}
              isSaved={savedRecipes.some(r => r.name === selectedSavedRecipe.name)}
            />
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-white/5 p-6 h-full">
            <NavContent />
          </aside>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 w-full bg-surface/90 backdrop-blur-md z-50 border-b border-white/5 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">N+</div>
              <span className="font-bold text-white">Nutri<span className="text-primary">+</span></span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-background z-40 pt-[calc(5rem+env(safe-area-inset-top))] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden flex flex-col animate-fade-in">
              <NavContent />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pt-[calc(5rem+env(safe-area-inset-top))] md:pt-0 p-6 md:p-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))] relative">
            <div className="max-w-7xl mx-auto h-full">
              {view === ViewState.DASHBOARD && (
                <Dashboard
                  userName={userName}
                  greeting={getGreeting()}
                  goals={goals}
                  meals={meals} // Pass FULL history for charts
                  selectedDate={historyDate} // Pass date for filtering stats
                  onAddMeal={() => setView(ViewState.SCAN_FOOD)}
                  onMealClick={meal => {
                    setSelectedMeal(meal);
                    // Optionally open modal? Yes, meal detail modal handles selectedMeal
                  }}
                />
              )}

              {view === ViewState.SCAN_FOOD && (
                <div className="pt-6">
                  <FoodAnalyzer
                    mode="track"
                    onSave={handleAddMeal}
                    onCancel={() => setView(ViewState.DASHBOARD)}
                  />
                </div>
              )}

              {view === ViewState.RECIPES && (
                <RecipeFinder
                  onSaveRecipe={handleToggleSaveRecipe}
                  onAddToDiet={handleAddRecipeToDiet}
                  savedRecipes={savedRecipes}
                />
              )}

              {view === ViewState.SAVED_RECIPES && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-8">Minhas Receitas Salvas</h2>
                  {savedRecipes.length === 0 ? (
                    <div className="text-center text-textMuted py-12 bg-surface rounded-2xl border border-dashed border-gray-700">
                      <BookHeart size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Você ainda não salvou nenhuma receita.</p>
                      <button
                        onClick={() => setView(ViewState.RECIPES)}
                        className="mt-4 text-primary hover:text-primaryHover underline"
                      >
                        Buscar receitas fitness
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedRecipes.map((recipe, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedSavedRecipe(recipe)}
                          className="bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 group cursor-pointer"
                        >
                          <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">{recipe.name}</h3>

                            <div className="flex items-center gap-4 text-xs text-textMuted py-2 border-t border-white/5 border-b">
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-primary" />
                                {recipe.timeToCook}
                              </div>
                              <div className="flex items-center gap-1">
                                <Gauge size={14} className="text-secondary" />
                                {recipe.difficulty}
                              </div>
                              <div className="flex items-center gap-1">
                                <Flame size={14} className="text-accent" />
                                {recipe.calories}
                              </div>
                            </div>

                            <div className="pt-2">
                              <p className="text-textMuted text-xs line-clamp-3">{recipe.description}</p>
                              <div className="mt-3 text-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver detalhes
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === ViewState.HISTORY && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-2xl border border-white/5">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <History className="text-primary" /> Histórico
                    </h2>

                    <div className="flex items-center gap-4 bg-surfaceHighlight p-2 rounded-xl">
                      <button
                        onClick={() => changeHistoryDate(-1)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm font-medium text-white min-w-[200px] text-center capitalize">
                        {historyDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => changeHistoryDate(1)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {getMealsForHistoryDate().length === 0 ? (
                      <div className="text-center py-12 text-textMuted bg-surface rounded-2xl border border-dashed border-gray-700">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhuma refeição registrada neste dia.</p>
                      </div>
                    ) : (
                      getMealsForHistoryDate().slice().reverse().map(meal => (
                        <div
                          key={meal.id}
                          onClick={() => setSelectedMeal(meal)}
                          className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-pointer relative"
                        >
                          <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {meal.imageUrl ? (
                              <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-textMuted text-xs bg-surfaceHighlight">Sem img</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white">{meal.name}</h3>
                            <div className="flex gap-2 text-sm text-textMuted">
                              <span>{new Date(meal.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              {meal.portion && <span>• {meal.portion}</span>}
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <span className="text-primary font-bold block">{meal.calories} kcal</span>
                            <span className="text-xs text-textMuted">P: {meal.protein}g C: {meal.carbs}g G: {meal.fat}g</span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteMeal(meal.id, e)}
                            title="Remover refeição"
                            className="p-2 bg-surface hover:bg-red-500/10 text-red-500 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 relative border border-white/5"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {view === ViewState.SETTINGS && (
                <Settings
                  goals={goals}
                  onUpdateGoals={handleOnboardingSave}
                  userEmail={session?.user?.email}
                />
              )}
            </div>
          </main>
        </>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribeSuccess}
      />
    </div>
  );
};

export default App;