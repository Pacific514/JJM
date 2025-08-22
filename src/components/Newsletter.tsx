
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Newsletter: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setStatus('loading');

    try {
      // Intégration Mailchimp
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          listId: process.env.REACT_APP_MAILCHIMP_LIST_ID,
          apiKey: process.env.REACT_APP_MAILCHIMP_API_KEY
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        toast.success('Inscription réussie à l\'infolettre !');
      } else {
        throw new Error('Erreur d\'inscription');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      console.error('Newsletter subscription error:', error);
    }

    // Reset status après 3 secondes
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Restez informé de nos services
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Recevez nos offres spéciales, conseils d'entretien et nouveautés directement dans votre boîte email
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  disabled={status === 'loading'}
                  className="
                    w-full px-4 py-3 rounded-lg text-gray-900 
                    placeholder-gray-500 focus:ring-2 focus:ring-white 
                    focus:border-transparent disabled:opacity-50
                  "
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="
                  bg-white text-red-600 px-6 py-3 rounded-lg font-semibold
                  hover:bg-gray-100 transition-colors disabled:opacity-50
                  flex items-center justify-center space-x-2
                "
              >
                {status === 'loading' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                ) : status === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : status === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                <span>
                  {status === 'loading' ? 'Inscription...' : 
                   status === 'success' ? 'Inscrit !' :
                   status === 'error' ? 'Erreur' : 'S\'inscrire'}
                </span>
              </button>
            </div>
          </form>

          <p className="text-sm text-red-100 mt-4">
            Pas de spam, désinscription facile à tout moment
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Newsletter;
