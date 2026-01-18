import React, { useState, useEffect } from 'react';
import { User, FeatureRequest } from '../types';
import { supabase } from '../lib/supabase';

interface FeatureFeedProps {
  user: User | null;
  onAuthClick: () => void;
}

export const FeatureFeed: React.FC<FeatureFeedProps> = ({ user, onAuthClick }) => {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Charger les requêtes depuis Supabase
  useEffect(() => {
    loadFeatureRequests();
  }, [user]);

  const loadFeatureRequests = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les requêtes triées par votes décroissants
      const { data: requests, error: requestsError } = await supabase
        .from('feature_requests')
        .select('*')
        .order('votes_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Si l'utilisateur est connecté, vérifier quelles requêtes il a votées
      if (user && requests) {
        const { data: votes, error: votesError } = await supabase
          .from('feature_votes')
          .select('feature_id')
          .eq('user_id', user.id);

        if (!votesError && votes) {
          const votedFeatureIds = new Set(votes.map(v => v.feature_id));
          requests.forEach(req => {
            req.has_voted = votedFeatureIds.has(req.id);
          });
        }
      }

      setFeatureRequests(requests || []);
    } catch (error) {
      console.error('Erreur lors du chargement des requêtes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onAuthClick();
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('feature_requests')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          votes_count: 0,
          status: 'pending'
        });

      if (error) throw error;

      // Réinitialiser le formulaire et recharger les requêtes
      setFormData({ title: '', description: '' });
      setShowForm(false);
      await loadFeatureRequests();
    } catch (error) {
      console.error('Erreur lors de la création de la requête:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (featureId: string, hasVoted: boolean) => {
    if (!user) {
      onAuthClick();
      return;
    }

    try {
      if (hasVoted) {
        // Retirer le vote
        const { error } = await supabase
          .from('feature_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('feature_id', featureId);

        if (error) throw error;
      } else {
        // Ajouter le vote
        const { error } = await supabase
          .from('feature_votes')
          .insert({
            user_id: user.id,
            feature_id: featureId
          });

        if (error) throw error;
      }

      // Recharger les requêtes pour mettre à jour les votes
      await loadFeatureRequests();
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      alert('Une erreur est survenue lors du vote. Veuillez réessayer.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      planned: 'bg-gold/20 text-gold border-gold/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    const labels = {
      pending: 'En attente',
      planned: 'Planifié',
      completed: 'Terminé'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <section id="roadmap" className="py-8 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gold">
              Roadmap Communautaire
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Vos <span className="text-gold">Idées</span> Comptent
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Proposez des améliorations et votez pour les fonctionnalités qui vous tiennent à cœur.
            Ensemble, façonnons l'avenir de SmartBookLM.
          </p>
        </div>

        {/* Formulaire de proposition */}
        <div className="mb-12">
          <div className="bg-anthracite-light/50 backdrop-blur-sm rounded-2xl border border-anthracite-lighter p-6 md:p-8">
            {!showForm ? (
              <button
                onClick={() => {
                  if (!user) {
                    onAuthClick();
                    return;
                  }
                  setShowForm(true);
                }}
                className={`w-full py-4 px-6 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all ${
                  user
                    ? 'bg-gold text-anthracite hover:bg-gold-light hover:shadow-lg hover:shadow-gold/10 active:scale-95'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600 cursor-not-allowed'
                }`}
              >
                {user ? '✨ Proposer une idée' : '🔒 Connectez-vous pour proposer une idée'}
              </button>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Titre de l'idée
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Export en PDF"
                    className="w-full px-4 py-3 bg-anthracite border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre idée en détail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-anthracite border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                    maxLength={500}
                    required
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 bg-gold text-anthracite rounded-xl font-black uppercase tracking-widest text-[12px] hover:bg-gold-light hover:shadow-lg hover:shadow-gold/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Envoi...' : 'Soumettre'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ title: '', description: '' });
                    }}
                    className="px-6 py-3 bg-transparent border border-anthracite-lighter text-slate-400 rounded-xl font-black uppercase tracking-widest text-[12px] hover:border-slate-600 hover:text-white transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Liste des requêtes */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm font-medium">Chargement des idées...</p>
          </div>
        ) : featureRequests.length === 0 ? (
          <div className="text-center py-16 bg-anthracite-light/50 backdrop-blur-sm rounded-2xl border border-anthracite-lighter">
            <p className="text-slate-400 text-lg font-medium">Aucune idée proposée pour le moment.</p>
            <p className="text-slate-500 text-sm mt-2">Soyez le premier à proposer une amélioration !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {featureRequests.map((request) => (
              <div
                key={request.id}
                className="bg-anthracite-light/50 backdrop-blur-sm rounded-2xl border border-anthracite-lighter p-6 md:p-8 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {request.title}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                      {request.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-anthracite-lighter">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(request.id, request.has_voted || false)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all ${
                        request.has_voted
                          ? 'bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30'
                          : 'bg-anthracite border border-anthracite-lighter text-slate-400 hover:border-gold/30 hover:text-gold'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${request.has_voted ? 'fill-gold' : 'fill-none'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{request.votes_count}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(request.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
