// mailer.js
// Récupère ta clé API ici : https://app.brevo.com/settings/keys/api
const BREVO_API_KEY = process.env.BREVO_API_KEY; 

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Gabin (SmartUnityIA)', email: 'contact@smartunityia.fr' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text || 'Merci de lire cet email en version HTML.'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur Brevo: ${JSON.stringify(errorData)}`);
    }

    console.log(`✅ Email envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Echec envoi email:', error);
    return false;
  }
};

// --- Comment l'utiliser dans ton code ---
// await sendEmail({
//   to: 'client@gmail.com',
//   subject: 'Bienvenue sur mon SaaS !',
//   html: '<h1>Merci pour ton achat</h1><p>Voici ton lien...</p>'
// });