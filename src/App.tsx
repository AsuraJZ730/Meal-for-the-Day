/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Utensils, 
  Flame, 
  ChefHat, 
  Heart, 
  Search, 
  X, 
  ChevronRight,
  Loader2,
  Soup,
  Beef,
  Scale,
  Smile,
  Bookmark
} from "lucide-react";
import { Recipe, UserInputs } from "./types";
import { generateRecipes } from "./services/geminiService";

export default function App() {
  const [inputs, setInputs] = useState<UserInputs>({
    taste: "",
    ingredients: "",
    calories: "",
    mood: ""
  });
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favorite_recipes");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorite_recipes", JSON.stringify(favorites));
  }, [favorites]);

  const handleGenerate = async () => {
    setLoading(true);
    setShowFavorites(false);
    try {
      const result = await generateRecipes(inputs);
      setRecipes(result);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favorites.some(f => f.name === recipe.name);
    if (isFav) {
      setFavorites(favorites.filter(f => f.name !== recipe.name));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorite = (recipe: Recipe) => favorites.some(f => f.name === recipe.name);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-16 pb-12 px-6 text-center relative">
        <button 
          onClick={() => setShowFavorites(!showFavorites)}
          className={`absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            showFavorites 
              ? "bg-brand-olive text-white border-brand-olive" 
              : "bg-white text-brand-ink/70 border-black/5 hover:border-brand-olive/30"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">收藏菜谱 ({favorites.length})</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="serif text-5xl md:text-7xl mb-4 tracking-tight">今天吃什么？</h1>
          <p className="text-brand-ink/60 text-lg md:text-xl max-w-xl mx-auto">
            输入你的想法，AI 助手为你定制专属美味。
          </p>
        </motion.div>
      </header>

      {/* Input Section */}
      <main className="max-w-4xl mx-auto px-6">
        {!showFavorites && (
          <motion.div 
            className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-black/5 border border-black/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup 
                label="口味偏好" 
                icon={<Soup className="w-5 h-5" />}
                placeholder="如：辣、清淡、酸甜..."
                value={inputs.taste}
                onChange={(v) => setInputs({ ...inputs, taste: v })}
              />
              <InputGroup 
                label="想吃的食材" 
                icon={<Beef className="w-5 h-5" />}
                placeholder="如：鸡肉、西红柿、鸡蛋..."
                value={inputs.ingredients}
                onChange={(v) => setInputs({ ...inputs, ingredients: v })}
              />
              <InputGroup 
                label="卡路里目标" 
                icon={<Scale className="w-5 h-5" />}
                placeholder="如：500kcal、低卡..."
                value={inputs.calories}
                onChange={(v) => setInputs({ ...inputs, calories: v })}
              />
              <InputGroup 
                label="当前心情" 
                icon={<Smile className="w-5 h-5" />}
                placeholder="如：疲惫、想吃点治愈的..."
                value={inputs.mood}
                onChange={(v) => setInputs({ ...inputs, mood: v })}
              />
            </div>

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-brand-olive text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-olive/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在为您构思...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    生成推荐
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results / Favorites Section */}
        <div id="results" className="mt-12">
          <AnimatePresence mode="wait">
            {showFavorites ? (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Bookmark className="w-6 h-6 text-brand-olive fill-current" />
                    <h2 className="serif text-4xl">我的收藏</h2>
                  </div>
                  <div className="h-1 w-20 bg-brand-olive mx-auto rounded-full" />
                  {favorites.length === 0 && (
                    <p className="mt-8 text-brand-ink/40 italic">暂无收藏菜谱，快去生成并收藏吧！</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((recipe, idx) => (
                    <RecipeCard 
                      key={idx} 
                      recipe={recipe} 
                      isFav={true}
                      onToggleFav={(e) => toggleFavorite(recipe, e)}
                      onClick={() => setSelectedRecipe(recipe)} 
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              recipes.length > 0 && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="text-center mb-12">
                    <h2 className="serif text-4xl mb-2">为您推荐</h2>
                    <div className="h-1 w-20 bg-brand-olive mx-auto rounded-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recipes.map((recipe, idx) => (
                      <RecipeCard 
                        key={idx} 
                        recipe={recipe} 
                        isFav={isFavorite(recipe)}
                        onToggleFav={(e) => toggleFavorite(recipe, e)}
                        onClick={() => setSelectedRecipe(recipe)} 
                      />
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe} 
            isFav={isFavorite(selectedRecipe)}
            onToggleFav={(e) => toggleFavorite(selectedRecipe, e)}
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const InputGroup: React.FC<{ 
  label: string; 
  icon: React.ReactNode; 
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, icon, placeholder, value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-brand-ink/70 font-medium text-sm uppercase tracking-wider">
        {icon}
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-cream/50 border border-black/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 focus:bg-white transition-all placeholder:text-brand-ink/30"
      />
    </div>
  );
}

const RecipeCard: React.FC<{ 
  recipe: Recipe; 
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onClick: () => void;
}> = ({ recipe, isFav, onToggleFav, onClick }) => {
  return (
    <motion.div
      layoutId={`card-${recipe.name}`}
      className="bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative"
      whileHover={{ y: -8 }}
      onClick={onClick}
    >
      <button
        onClick={onToggleFav}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isFav ? "bg-red-50 text-red-500" : "bg-black/10 text-white hover:bg-black/20"
        }`}
      >
        <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
      </button>

      <div className="aspect-[4/3] relative overflow-hidden bg-brand-cream/30 flex items-center justify-center">
        <div className="text-[48px] text-center select-none">
          {recipe.emojis || "🍽"}
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {recipe.cuisine}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="serif text-2xl font-bold">{recipe.name}</h3>
          <span className="flex items-center gap-1 text-xs text-brand-ink/50 font-medium">
            <Flame className="w-3 h-3 text-orange-500" />
            {recipe.calories}
          </span>
        </div>
        <p className="text-brand-ink/60 text-sm line-clamp-2 mb-6 leading-relaxed italic">
          “{recipe.reason}”
        </p>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {recipe.ingredients.slice(0, 3).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-brand-cream border-2 border-white flex items-center justify-center">
                <Utensils className="w-3 h-3 text-brand-olive" />
              </div>
            ))}
            {recipe.ingredients.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-brand-cream border-2 border-white flex items-center justify-center text-[8px] font-bold">
                +{recipe.ingredients.length - 3}
              </div>
            )}
          </div>
          <span className="text-brand-olive text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            查看做法 <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const RecipeModal: React.FC<{ 
  recipe: Recipe; 
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
  onClose: () => void;
}> = ({ recipe, isFav, onToggleFav, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
      />
      <motion.div
        layoutId={`card-${recipe.name}`}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
      >
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <button 
            onClick={onToggleFav}
            className={`p-2 rounded-full backdrop-blur transition-all ${
              isFav ? "bg-red-50 text-red-500" : "bg-white/80 text-brand-ink/70 hover:bg-white"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFav ? "fill-current" : ""}`} />
          </button>
          <button 
            onClick={onClose}
            className="bg-white/80 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="md:w-1/2 h-64 md:h-auto relative bg-brand-cream/30 flex items-center justify-center">
          <div className="text-[80px] text-center select-none">
            {recipe.emojis || "🍽"}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
          <div className="absolute bottom-6 left-6 text-white md:hidden">
            <h2 className="serif text-4xl font-bold">{recipe.name}</h2>
            <p className="text-white/80 text-sm">{recipe.cuisine} · {recipe.calories}</p>
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
          <div className="hidden md:block mb-8">
            <div className="flex items-center gap-3 text-brand-olive font-bold text-xs uppercase tracking-widest mb-2">
              <span>{recipe.cuisine}</span>
              <span className="w-1 h-1 rounded-full bg-brand-olive/30" />
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" /> {recipe.calories}
              </span>
            </div>
            <h2 className="serif text-5xl font-bold mb-4">{recipe.name}</h2>
            <p className="text-brand-ink/70 italic border-l-4 border-brand-olive/20 pl-4 py-1">
              {recipe.reason}
            </p>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-ink/40 mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> 所需食材
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="bg-brand-cream px-4 py-2 rounded-xl text-sm font-medium">
                    {ing}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-ink/40 mb-4 flex items-center gap-2">
                <ChefHat className="w-4 h-4" /> 烹饪步骤
              </h3>
              <div className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="serif text-2xl text-brand-olive/30 font-bold shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-brand-ink/80 leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
