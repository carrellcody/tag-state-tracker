import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorites(favoriteType: string) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem(`${favoriteType}Favorites`);
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
      setLoading(false);
    }
  }, [user, favoriteType]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('favorite_key')
        .eq('user_id', user.id)
        .eq('favorite_type', favoriteType);

      if (error) throw error;

      const favSet = new Set(data.map(f => f.favorite_key));
      setFavorites(favSet);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (key: string) => {
    const newFavs = new Set(favorites);
    const isAdding = !newFavs.has(key);

    if (isAdding) {
      newFavs.add(key);
    } else {
      newFavs.delete(key);
    }
    
    setFavorites(newFavs);

    if (user) {
      // Save to database for authenticated users
      try {
        if (isAdding) {
          await supabase.from('favorites').insert({
            user_id: user.id,
            favorite_type: favoriteType,
            favorite_key: key
          });
        } else {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('favorite_type', favoriteType)
            .eq('favorite_key', key);
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // Revert on error
        setFavorites(favorites);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem(`${favoriteType}Favorites`, JSON.stringify(Array.from(newFavs)));
    }
  };

  return { favorites, toggleFavorite, loading };
}
