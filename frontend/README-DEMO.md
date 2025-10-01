# 🎭 Mode Démo de Unity DevOps IDE

## Activation du mode démo

Le mode démo permet de tester l'interface sans backend en utilisant des données mock.

### Méthode 1 : Via fichier .env

```bash
# Copier le fichier de configuration démo
cp .env.demo .env

# Lancer l'application
npm run dev
```

### Méthode 2 : Via localStorage (dans la console du navigateur)

```javascript
// Activer le mode démo
localStorage.setItem('demoMode', 'true');

// Recharger la page
location.reload();

// Pour désactiver
localStorage.removeItem('demoMode');
location.reload();
```

### Méthode 3 : Variable d'environnement directe

```bash
VITE_DEMO_MODE=true npm run dev
```

## Fonctionnalités disponibles en mode démo

✅ **Dashboard** - Vue d'ensemble avec données mock
✅ **Docker** - Conteneurs simulés (nginx, node, redis)
✅ **Kubernetes** - Pods et services simulés
✅ **Monitoring** - Métriques temps réel générées aléatoirement
✅ **Graphe d'infrastructure** - Topologie interactive
✅ **Terminal contextuel** - Commandes simulées
✅ **Logs** - Logs d'exemple pour containers et pods

## Données mock incluses

### Conteneurs Docker
- `web-server` (nginx:latest)
- `api-backend` (node:18-alpine)
- `redis-cache` (redis:7-alpine)

### Pods Kubernetes
- `frontend-deployment-5f7b9c8d-x9k2m`
- `backend-api-7d8c9f-h4j6k`
- `database-statefulset-0`

### Services Kubernetes
- `frontend-service` (LoadBalancer)
- `backend-api-service` (ClusterIP)

### Métriques système
- CPU: 8 cœurs
- RAM: 16 GB
- Docker: v24.0.7
- Kubernetes: v1.28.3

## Notes

- Les actions (start/stop/restart/scale) sont simulées avec des logs en console
- Les métriques sont mises à jour toutes les 5 secondes
- Aucun backend réel n'est requis
- Idéal pour démonstrations et développement frontend
