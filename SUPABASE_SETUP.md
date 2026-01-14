# 🚀 Guide de Configuration Supabase pour SmartBookLM

## ✅ Étape 1 : Vérifier les Variables d'Environnement

Votre fichier `.env` doit contenir :
```env
VITE_SUPABASE_URL=https://nuirbonaeimdwzuzakai.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_eyJ...
```

## ✅ Étape 2 : Créer la Table `profiles`

1. **Ouvrez votre Dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"** (menu de gauche)
4. **Cliquez sur "New Query"**
5. **Copiez-collez le contenu du fichier `supabase-setup.sql`**
6. **Cliquez sur "Run"** (ou Ctrl+Enter)

Cette commande va :
- ✅ Créer la table `profiles`
- ✅ Activer Row Level Security (RLS)
- ✅ Créer les politiques de sécurité
- ✅ Créer un trigger pour créer automatiquement un profil lors de l'inscription

## ✅ Étape 3 : Configurer Google OAuth

1. **Dans le Dashboard Supabase**, allez dans **"Authentication" > "Providers"**
2. **Activez "Google"**
3. **Récupérez vos identifiants Google OAuth** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un projet ou sélectionnez-en un existant
   - Activez l'API "Google+ API"
   - Créez des identifiants OAuth 2.0 :
     - Type : Application Web
     - URI de redirection autorisés : `https://nuirbonaeimdwzuzakai.supabase.co/auth/v1/callback`
     - URI de redirection autorisés (local) : `http://localhost:1212/auth/v1/callback`
4. **Copiez le Client ID et Client Secret** dans Supabase
5. **Sauvegardez**

## ✅ Étape 4 : Vérifier les URL de Redirection

Dans **"Authentication" > "URL Configuration"**, assurez-vous que :
- **Site URL** : `http://localhost:1212` (pour le dev)
- **Redirect URLs** contient :
  - `http://localhost:1212/**`
  - `https://votre-domaine.com/**` (si vous avez un domaine)

## ✅ Étape 5 : Tester la Connexion

1. **Démarrez votre application** : `npm run dev`
2. **Cliquez sur "Se connecter"**
3. **Cliquez sur "Continuer avec Google"**
4. **Connectez-vous avec votre compte Google**
5. **Vous devriez être redirigé vers l'application**

## 🔍 Vérifications Finales

### Vérifier que la table existe :
```sql
SELECT * FROM public.profiles LIMIT 1;
```

### Vérifier les politiques RLS :
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Vérifier le trigger :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 🐛 Dépannage

### Erreur : "relation profiles does not exist"
→ Exécutez le script SQL `supabase-setup.sql`

### Erreur : "permission denied for table profiles"
→ Vérifiez que les politiques RLS sont créées

### Erreur OAuth : "redirect_uri_mismatch"
→ Vérifiez que l'URL de redirection dans Google Cloud Console correspond exactement à celle dans Supabase

### Le profil n'est pas créé automatiquement
→ Vérifiez que le trigger `on_auth_user_created` existe et est actif

## 📝 Notes Importantes

- La table `profiles` est liée à `auth.users` via l'ID
- Le plan par défaut est `'free'` avec 0 crédits
- Les crédits peuvent être mis à jour via l'interface d'administration Supabase
- Le trigger crée automatiquement un profil lors de la première connexion
