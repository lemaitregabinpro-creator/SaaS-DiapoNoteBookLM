// Script de test pour valider la configuration Supabase
// À exécuter manuellement pour vérifier vos clés

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Vérification Configuration Supabase ===');
console.log('URL:', supabaseUrl ? '✓ Présente' : '✗ Manquante');
console.log('Key:', supabaseAnonKey ? '✓ Présente' : '✗ Manquante');

if (supabaseUrl && supabaseAnonKey) {
  console.log('\n=== Format de la clé ===');
  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('✓ Format JWT classique (eyJ...) - Clé anon standard');
  } else if (supabaseAnonKey.startsWith('sb_')) {
    console.log('⚠ Format "sb_" détecté - Vérifiez que c\'est bien la clé "anon public"');
    console.log('   Les clés Supabase anon commencent généralement par "eyJ"');
    console.log('   Vous pouvez trouver la bonne clé dans:');
    console.log('   Supabase Dashboard > Settings > API > Project API keys > anon public');
  } else {
    console.log('⚠ Format inhabituel - Vérifiez votre clé');
  }

  // Test de connexion
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('\n=== Test de connexion ===');
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('✗ Erreur de connexion:', error.message);
      } else {
        console.log('✓ Connexion réussie');
      }
    });
  } catch (error) {
    console.log('✗ Erreur lors de la création du client:', error);
  }
}
