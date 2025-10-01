/**
 * Smart Onboarding
 * Guide l'utilisateur en fonction de ce qui est installé sur son système
 * Comme Docker Desktop / Lens
 */

import React, { useState } from 'react';
import { SystemCapabilities } from '../services/autoDiscoveryService';

interface SmartOnboardingProps {
  capabilities: SystemCapabilities;
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  actionLabel?: string;
}

export const SmartOnboarding: React.FC<SmartOnboardingProps> = ({
  capabilities,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Générer des étapes personnalisées selon ce qui est installé
  const generateSteps = (): OnboardingStep[] => {
    const steps: OnboardingStep[] = [];

    // Étape 1 : Bienvenue
    steps.push({
      id: 'welcome',
      title: 'Bienvenue dans Unity DevOps IDE',
      description: 'Votre IDE est prêt ! Nous avons détecté votre configuration et tout est configuré automatiquement.',
      icon: '🎉',
    });

    // Étape 2 : Docker
    if (capabilities.docker.available) {
      steps.push({
        id: 'docker',
        title: 'Docker est prêt',
        description: `Docker ${capabilities.docker.version} détecté. Vous pouvez gérer vos conteneurs, images et volumes directement depuis l'IDE.`,
        icon: '🐳',
        action: '/docker',
        actionLabel: 'Voir mes conteneurs',
      });
    } else {
      steps.push({
        id: 'docker-install',
        title: 'Docker non installé',
        description: 'Pour gérer des conteneurs, installez Docker Desktop depuis docker.com',
        icon: '🐳',
      });
    }

    // Étape 3 : Kubernetes
    if (capabilities.kubernetes.available) {
      steps.push({
        id: 'kubernetes',
        title: 'Kubernetes détecté',
        description: `Contexte actuel : ${capabilities.kubernetes.config?.currentContext || 'default'}. Tous vos clusters sont accessibles depuis l'IDE.`,
        icon: '☸️',
        action: '/kubernetes',
        actionLabel: 'Explorer mes clusters',
      });
    } else if (capabilities.minikube.available) {
      steps.push({
        id: 'minikube',
        title: 'Minikube disponible',
        description: 'Minikube est installé. Vous pouvez démarrer un cluster K8s local en un clic.',
        icon: '🎡',
        action: '/kubernetes/start-minikube',
        actionLabel: 'Démarrer Minikube',
      });
    } else {
      steps.push({
        id: 'kubernetes-install',
        title: 'Kubernetes non configuré',
        description: 'Installez Minikube, Docker Desktop avec K8s, ou connectez-vous à un cluster distant.',
        icon: '☸️',
      });
    }

    // Étape 4 : Raccourcis K9s
    steps.push({
      id: 'shortcuts',
      title: 'Raccourcis Clavier K9s',
      description: 'Naviguez avec j/k, changez de vue avec 0-5, ouvrez le terminal avec Ctrl+T. Appuyez sur h pour l\'aide complète.',
      icon: '⌨️',
    });

    // Étape 5 : Fonctionnalités IA
    steps.push({
      id: 'ai-features',
      title: 'Intelligence Artificielle Intégrée',
      description: 'L\'IDE analyse automatiquement votre infrastructure et propose des optimisations. Les problèmes sont détectés et corrigés automatiquement.',
      icon: '🤖',
    });

    // Étape Finale
    steps.push({
      id: 'ready',
      title: 'Tout est prêt !',
      description: 'Unity DevOps IDE est configuré et prêt à l\'emploi. Commencez à gérer votre infrastructure dès maintenant.',
      icon: '🚀',
      action: '/dashboard',
      actionLabel: 'Aller au Dashboard',
    });

    return steps;
  };

  const steps = generateSteps();
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl">
        {/* Progress Indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index === currentStep
                    ? 'bg-blue-600 text-white scale-110'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-6 animate-bounce">{step.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* System Info (pour debug) */}
        {showDetails && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
              <pre>{JSON.stringify(capabilities, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Action Button (si disponible) */}
        {step.action && step.actionLabel && (
          <div className="flex justify-center mb-6">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              {step.actionLabel} →
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium"
          >
            Passer le tutoriel
          </button>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                ← Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep < steps.length - 1 ? 'Suivant →' : 'Commencer 🚀'}
            </button>
          </div>
        </div>

        {/* Debug Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {showDetails ? 'Masquer' : 'Afficher'} les détails système
        </button>
      </div>
    </div>
  );
};

export default SmartOnboarding;
