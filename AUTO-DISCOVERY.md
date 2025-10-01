# 🔍 Auto-Discovery System

## Vision

**Unity DevOps IDE** doit être **plug-and-play** comme **Docker Desktop**, **Lens** ou **K9s**. Aucune configuration manuelle requise !

---

## 🎯 Fonctionnement

### **Au Premier Lancement**

```
1. 🔍 Découverte automatique du système
   ├── Docker installé ? Version ? Socket ?
   ├── Kubernetes configuré ? Contextes ? Clusters ?
   ├── Ansible disponible ? Inventaires ?
   └── Outils annexes ? (kubectl, helm, minikube)

2. 🎨 Interface adaptée automatiquement
   ├── Docker disponible → Module Docker activé
   ├── K8s disponible → Module Kubernetes activé
   └── Rien installé → Mode démo avec données mock

3. 🚀 Onboarding personnalisé
   ├── Guide selon ce qui est installé
   ├── Tutoriels adaptés
   └── Suggestions d'installation
```

---

## 🛠️ Services Détectés

### **Docker** 🐳
- **Détection** : Socket `/var/run/docker.sock`
- **Version** : Via API Docker
- **Config** : Contextes, registries
- **Status** : Running, stopped, non installé

### **Kubernetes** ☸️
- **Détection** : Fichier `~/.kube/config`
- **Version** : Via `kubectl version`
- **Config** : Contextes, clusters, namespaces
- **Status** : Accessible, non accessible

### **Ansible** 🎭
- **Détection** : Commande `ansible --version`
- **Config** : Inventaires, playbooks
- **Status** : Installé, non installé

### **Helm** ⎈
- **Détection** : Commande `helm version`
- **Config** : Repos configurés
- **Status** : Installé, non installé

### **Minikube** 🎡
- **Détection** : Commande `minikube status`
- **Config** : Driver, profils
- **Status** : Running, stopped, non installé

### **Podman** 🦭
- **Détection** : Alternative à Docker
- **Config** : Similaire à Docker
- **Status** : Installé, non installé

---

## 📖 Utilisation

### **Dans un Composant React**

```typescript
import { useAutoDiscovery } from '../hooks/useAutoDiscovery';

function MyComponent() {
  const { capabilities, discovering, isAvailable } = useAutoDiscovery();

  if (discovering) {
    return <div>Découverte en cours...</div>;
  }

  return (
    <div>
      {isAvailable('docker') && <DockerModule />}
      {isAvailable('kubernetes') && <KubernetesModule />}
      {!isAvailable('docker') && <InstallDockerGuide />}
    </div>
  );
}
```

### **Manuellement avec le Service**

```typescript
import { autoDiscoveryService } from '../services/autoDiscoveryService';

// Découverte automatique
const capabilities = await autoDiscoveryService.discover();

// Vérifier un service
if (autoDiscoveryService.isAvailable('docker')) {
  console.log('Docker is ready!');
}

// Obtenir la configuration
const dockerConfig = autoDiscoveryService.getConfig('docker');
console.log('Docker version:', dockerConfig.version);

// Forcer une redécouverte
await autoDiscoveryService.rediscover();
```

---

## 🎨 Composants Disponibles

### **1. SystemDiscovery**

Splash screen de découverte au premier lancement

```tsx
import { SystemDiscovery } from './components/SystemDiscovery';

<SystemDiscovery
  onComplete={(capabilities) => {
    console.log('Discovery done!', capabilities);
  }}
/>
```

### **2. SmartOnboarding**

Onboarding adapté selon ce qui est installé

```tsx
import { SmartOnboarding } from './components/SmartOnboarding';

<SmartOnboarding
  capabilities={capabilities}
  onComplete={() => {
    console.log('Onboarding complete!');
  }}
/>
```

---

## 🔄 Cache Intelligent

Le système met en cache les résultats pour **5 minutes** :

```typescript
// Chargé automatiquement du cache si disponible
const capabilities = await autoDiscoveryService.discover();

// Forcer une nouvelle découverte
await autoDiscoveryService.rediscover();
```

---

## 📊 Rapport Système

Générer un rapport lisible :

```typescript
const report = autoDiscoveryService.getReport();
console.log(report);
```

**Output :**

```
Unity DevOps IDE - System Report
═══════════════════════════════

✅ Available Services (3):
  • docker
  • kubernetes
  • kubectl

❌ Unavailable Services (4):
  • ansible
  • helm
  • minikube
  • podman

💡 Tip: Install missing services to unlock full capabilities!
```

---

## 🚀 Intégration dans l'App

### **App.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { SystemDiscovery } from './components/SystemDiscovery';
import { SmartOnboarding } from './components/SmartOnboarding';
import { SystemCapabilities } from './services/autoDiscoveryService';

function App() {
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);

  // Vérifier si c'est le premier lancement
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('unity-ide-onboarding-done');
    if (hasSeenOnboarding) {
      setShowDiscovery(false);
    }
  }, []);

  const handleDiscoveryComplete = (caps: SystemCapabilities) => {
    setCapabilities(caps);
    setShowDiscovery(false);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('unity-ide-onboarding-done', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showDiscovery && (
        <SystemDiscovery onComplete={handleDiscoveryComplete} />
      )}
      
      {showOnboarding && capabilities && (
        <SmartOnboarding
          capabilities={capabilities}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Application principale */}
      <MainApp capabilities={capabilities} />
    </>
  );
}
```

---

## 💡 Comportement Intelligent

### **Scenario 1 : Tout est installé** ✅

```
🔍 Découverte système
  ✅ Docker 24.0.0 détecté
  ✅ Kubernetes v1.28.0 détecté (contexte: minikube)
  ✅ Ansible 2.15.0 détecté

🎉 Bienvenue !
  → Tous les modules sont activés
  → Interface complète disponible
  → Mode production activé
```

### **Scenario 2 : Seulement Docker** 🐳

```
🔍 Découverte système
  ✅ Docker 24.0.0 détecté
  ❌ Kubernetes non configuré
  ❌ Ansible non installé

💡 Configuration partielle
  → Module Docker activé
  → Suggestion : Installer Minikube pour K8s
  → Guide d'installation proposé
```

### **Scenario 3 : Rien d'installé** 📦

```
🔍 Découverte système
  ❌ Docker non installé
  ❌ Kubernetes non configuré
  ❌ Ansible non installé

🎨 Mode Démo activé
  → Données mock pour explorer l'interface
  → Tutoriels d'installation disponibles
  → Guides pour débutants
```

---

## 🎓 Expérience Utilisateur

### **Comme Docker Desktop**
- ✅ Détection automatique au lancement
- ✅ Configuration zero-touch
- ✅ Interface adaptée automatiquement

### **Comme Lens**
- ✅ Découverte des contextes K8s
- ✅ Multi-cluster automatique
- ✅ Pas de configuration manuelle

### **Comme K9s**
- ✅ Connexion instantanée
- ✅ Détection des namespaces
- ✅ Prêt à l'emploi

---

## 🔐 Sécurité & Confidentialité

- **Aucune donnée envoyée** : Tout est local
- **Pas de télémétrie** : Votre config reste privée
- **Lecture seule** : Pas de modification automatique
- **Cache local** : Stocké uniquement dans localStorage

---

## 🎯 Résultat

**Unity DevOps IDE = Plug & Play !**

```bash
# Installer
./install.sh

# Lancer
devops-unity-ide

# Ça marche ! 🎉
# - Docker détecté automatiquement
# - Kubernetes configuré automatiquement
# - Interface adaptée automatiquement
# - Prêt à l'emploi sans configuration
```

**Exactement comme Docker Desktop, Lens ou K9s !** 🚀

---

## 📝 TODO

### **Phase 1 : Détection de Base** ✅
- [x] Docker (socket + API)
- [x] Kubernetes (kubeconfig)
- [x] Ansible (CLI)
- [x] Helm, kubectl, minikube

### **Phase 2 : Détection Avancée** 🚧
- [ ] Docker Compose
- [ ] Docker Swarm
- [ ] Rancher
- [ ] OpenShift
- [ ] AWS EKS contexts
- [ ] Azure AKS contexts
- [ ] GCP GKE contexts

### **Phase 3 : Auto-Configuration** 🎯
- [ ] Créer .kube/config si absent
- [ ] Proposer installation Minikube
- [ ] Setup Ansible inventory automatique
- [ ] Démarrage auto des services

---

**Unity DevOps IDE : L'IDE qui comprend votre système automatiquement ! 🤖✨**
