-- ============================================
-- CONFIGURATION SUPABASE POUR FEATURE REQUESTS
-- ============================================
-- Exécutez ces commandes dans l'éditeur SQL de Supabase
-- (Dashboard > SQL Editor > New Query)

-- 1. Créer la table feature_requests
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planned', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table feature_votes (table de liaison pour éviter les votes multiples)
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_id UUID REFERENCES public.feature_requests(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_id) -- Empêche les votes multiples
);

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes_count ON public.feature_requests(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON public.feature_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_feature ON public.feature_votes(user_id, feature_id);

-- 4. Activer Row Level Security (RLS)
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour feature_requests
-- Lecture publique (tous peuvent voir les requêtes)
CREATE POLICY "Anyone can view feature requests"
  ON public.feature_requests FOR SELECT
  USING (true);

-- Seuls les utilisateurs authentifiés peuvent créer des requêtes
CREATE POLICY "Authenticated users can create feature requests"
  ON public.feature_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seuls les créateurs peuvent modifier leurs requêtes
CREATE POLICY "Users can update own feature requests"
  ON public.feature_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Politiques RLS pour feature_votes
-- Lecture publique (tous peuvent voir les votes)
CREATE POLICY "Anyone can view feature votes"
  ON public.feature_votes FOR SELECT
  USING (true);

-- Seuls les utilisateurs authentifiés peuvent voter
CREATE POLICY "Authenticated users can vote"
  ON public.feature_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seuls les utilisateurs peuvent supprimer leurs propres votes
CREATE POLICY "Users can delete own votes"
  ON public.feature_votes FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Fonction pour mettre à jour votes_count automatiquement
CREATE OR REPLACE FUNCTION public.update_feature_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests
    SET votes_count = votes_count + 1
    WHERE id = NEW.feature_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_requests
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.feature_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Triggers pour mettre à jour votes_count
DROP TRIGGER IF EXISTS trigger_update_votes_count_insert ON public.feature_votes;
CREATE TRIGGER trigger_update_votes_count_insert
  AFTER INSERT ON public.feature_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feature_votes_count();

DROP TRIGGER IF EXISTS trigger_update_votes_count_delete ON public.feature_votes;
CREATE TRIGGER trigger_update_votes_count_delete
  AFTER DELETE ON public.feature_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feature_votes_count();

-- 9. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger pour updated_at sur feature_requests
DROP TRIGGER IF EXISTS trigger_update_feature_requests_updated_at ON public.feature_requests;
CREATE TRIGGER trigger_update_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
