import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onLoadComplete: () => void;
}

const SplashScreen = ({ onLoadComplete }: SplashScreenProps) => {
  const [status, setStatus] = useState('Initialisation...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = [
      'Initialisation...',
      'Chargement de l\'application...',
      'Connexion au serveur...',
      'Configuration en cours...',
      'Presque prêt...',
    ];

    let currentMessage = 0;
    const messageInterval = setInterval(() => {
      if (currentMessage < messages.length) {
        setStatus(messages[currentMessage]);
        setProgress(((currentMessage + 1) / messages.length) * 100);
        currentMessage++;
      }
    }, 800);

    // Terminer après 4 secondes
    const timer = setTimeout(() => {
      clearInterval(messageInterval);
      setStatus('Chargement terminé !');
      setProgress(100);
      setTimeout(onLoadComplete, 500);
    }, 4000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timer);
    };
  }, [onLoadComplete]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="logo">
          <div className="logo-text">YC</div>
        </div>
        <h1>YOU CAISSE PRO</h1>
        <div className="subtitle">Système de Caisse Professionnel</div>

        <div className="loading">
          <div className="loading-text">{status}</div>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
