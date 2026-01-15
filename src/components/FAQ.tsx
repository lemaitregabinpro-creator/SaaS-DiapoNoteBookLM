import React, { useState } from 'react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-anthracite-lighter last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-gold' : 'text-slate-300 group-hover:text-white'}`}>
          {question}
        </span>
        <span className={`ml-6 flex-shrink-0 text-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400 leading-relaxed pr-12">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      id: 'faq-1',
      question: "Comment fonctionne la technologie de nettoyage SmartBookLM ?",
      answer: "Notre algorithme propriétaire analyse la structure pixel de vos diapositives (notamment celles issues de NotebookLM) pour identifier et dissoudre les filigranes sans altérer la qualité du texte ou des graphiques. Le résultat est une image nativement pure."
    },
    {
      id: 'faq-2',
      question: "La qualité HD (300 DPI) est-elle garantie ?",
      answer: "Absolument. Contrairement aux outils de capture d'écran classiques qui dégradent l'image, SmartBookLM reconstruit vectoriellement les éléments pour un export ultra-haute définition, parfait pour les présentations professionnelles sur grand écran."
    },
    {
      id: 'faq-3',
      question: "Mes documents sont-ils confidentiels ?",
      answer: "La confidentialité est notre luxe ultime. Vos fichiers sont traités en temps réel et ne sont jamais stockés sur nos serveurs au-delà de la durée de la session. Votre propriété intellectuelle reste inviolée."
    },
    {
      id: 'faq-4',
      question: "Comment mon abonnement aide-t-il les animaux ?",
      answer: "L'influence positive est au cœur de SmartUnityIA. 15% de chaque abonnement est reversé mensuellement à des refuges vérifiés. Nous transformons votre productivité en repas et en soins vétérinaires."
    }
  ];

  return (
    <section className="py-12 max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Questions <span className="text-gold">Fréquentes</span>
        </h2>
        <p className="text-slate-400">Tout ce que vous devez savoir sur l'excellence SmartBookLM.</p>
      </div>
      <div className="bg-anthracite-light rounded-[2.5rem] p-8 md:p-12 border border-anthracite-lighter shadow-2xl">
        {faqs.map((faq) => (
          // @ts-ignore - key est une prop spéciale React, pas une prop du composant
          <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};