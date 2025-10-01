# 🔌 Unity IDE Extension SDK

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-10-01

---

## 📋 **Table des Matières**

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quickstart](#quickstart)
4. [API Reference](#api-reference)
5. [Extension Manifest](#extension-manifest)
6. [Publishing](#publishing)
7. [Examples](#examples)

---

## 🎯 **Introduction**

Unity IDE Extension SDK permet aux développeurs de créer des extensions pour Unity DevOps IDE. Les extensions peuvent :

- Ajouter des commandes personnalisées
- Créer des vues dans la sidebar
- Intégrer des outils externes
- Personnaliser l'interface
- Ajouter des fonctionnalités DevOps

---

## 📦 **Installation**

### **Via NPM**

```bash
npm install @unity-ide/extension-sdk
```

### **Prérequis**

- Node.js ≥ 16
- TypeScript ≥ 4.5
- React ≥ 18

---

## 🚀 **Quickstart**

### **1. Créer le manifest**

Créez un fichier `extension.json` :

```json
{
  "id": "my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "description": "My awesome extension",
  "author": "Your Name",
  "publisher": "your-publisher",
  "main": "dist/extension.js",
  "engines": {
    "unity": "^1.0.0"
  },
  "contributes": {
    "commands": [
      {
        "command": "myext.helloWorld",
        "title": "Hello World",
        "category": "My Extension"
      }
    ]
  }
}
```

### **2. Créer l'extension**

Créez `src/extension.ts` :

```typescript
import { Extension, ExtensionContext } from '@unity-ide/extension-sdk';

class MyExtension extends Extension {
  activate(context: ExtensionContext): void {
    // Enregistrer une commande
    this.addDisposable(
      window.UnityIDE.commands.register('myext.helloWorld', () => {
        window.UnityIDE.notifications.info('Hello World!');
      })
    );

    context.logger.info('Extension activated!');
  }

  deactivate(): void {
    // Nettoyage automatique
  }
}

export default (context: ExtensionContext) => new MyExtension();
```

### **3. Build & Test**

```bash
npm run build
unity-ide --load-extension ./dist
```

---

## 📚 **API Reference**

### **UnityIDE API**

L'API globale `window.UnityIDE` expose :

#### **Commands API**

```typescript
// Enregistrer une commande
UnityIDE.commands.register(command: string, handler: Function): void

// Exécuter une commande
UnityIDE.commands.execute(command: string, ...args: any[]): Promise<any>

// Vérifier si une commande existe
UnityIDE.commands.exists(command: string): boolean
```

**Exemple :**

```typescript
UnityIDE.commands.register('docker.listContainers', async () => {
  const containers = await fetch('/api/v1/docker/containers').then(r => r.json());
  return containers;
});

// Exécuter
const containers = await UnityIDE.commands.execute('docker.listContainers');
```

---

#### **Views API**

```typescript
// Créer une vue
UnityIDE.views.create(container: string, viewId: string, component: React.ComponentType): void

// Mettre à jour une vue
UnityIDE.views.update(viewId: string, props: any): void

// Supprimer une vue
UnityIDE.views.remove(viewId: string): void

// Focus une vue
UnityIDE.views.focus(viewId: string): void
```

**Exemple :**

```typescript
const MyView = () => (
  <div>
    <h3>My Custom View</h3>
    <button onClick={() => UnityIDE.notifications.info('Clicked!')}>
      Click me
    </button>
  </div>
);

UnityIDE.views.create('sidebar', 'my-view', MyView);
```

---

#### **UI API**

```typescript
// Afficher une boîte de dialogue
UnityIDE.ui.showDialog(options: DialogOptions): Promise<DialogResult>

// Sélecteur de fichiers
UnityIDE.ui.showFilePicker(options: FilePickerOptions): Promise<string[]>

// Menu contextuel
UnityIDE.ui.showContextMenu(items: ContextMenuItem[], position: {x, y}): Promise<string>

// Status bar item
UnityIDE.ui.createStatusBarItem(options: StatusBarItemOptions): StatusBarItem
```

**Exemple :**

```typescript
const result = await UnityIDE.ui.showDialog({
  title: 'Confirm Action',
  message: 'Are you sure?',
  type: 'warning',
  buttons: ['Yes', 'No'],
  defaultButton: 0
});

if (result.button === 0) {
  // User clicked Yes
}
```

---

#### **Config API**

```typescript
// Obtenir une config
UnityIDE.config.get<T>(key: string, defaultValue?: T): T

// Définir une config
UnityIDE.config.set(key: string, value: any): void

// Écouter les changements
UnityIDE.config.onChange(callback: (key: string, value: any) => void): void
```

**Exemple :**

```typescript
const apiKey = UnityIDE.config.get('myext.apiKey', '');

UnityIDE.config.onChange((key, value) => {
  if (key === 'myext.apiKey') {
    console.log('API Key changed:', value);
  }
});
```

---

#### **Notifications API**

```typescript
UnityIDE.notifications.info(message: string, options?: NotificationOptions): void
UnityIDE.notifications.warn(message: string, options?: NotificationOptions): void
UnityIDE.notifications.error(message: string, options?: NotificationOptions): void
UnityIDE.notifications.success(message: string, options?: NotificationOptions): void
```

**Exemple :**

```typescript
UnityIDE.notifications.success('Deployment completed!', {
  timeout: 3000,
  action: {
    label: 'View Logs',
    command: 'logs.show'
  }
});
```

---

#### **Logger API**

```typescript
UnityIDE.logger.debug(message: string, ...args: any[]): void
UnityIDE.logger.info(message: string, ...args: any[]): void
UnityIDE.logger.warn(message: string, ...args: any[]): void
UnityIDE.logger.error(message: string, ...args: any[]): void
```

---

#### **Workspace API**

```typescript
// Obtenir le dossier racine
UnityIDE.workspace.rootPath: string

// Lister les fichiers
UnityIDE.workspace.getFiles(pattern?: string): Promise<string[]>

// Lire un fichier
UnityIDE.workspace.readFile(path: string): Promise<string>

// Écrire un fichier
UnityIDE.workspace.writeFile(path: string, content: string): Promise<void>

// Surveiller les changements
UnityIDE.workspace.watch(pattern: string, callback: (event, path) => void): void
```

**Exemple :**

```typescript
// Lire tous les Dockerfiles
const dockerfiles = await UnityIDE.workspace.getFiles('**/Dockerfile');

for (const file of dockerfiles) {
  const content = await UnityIDE.workspace.readFile(file);
  // Analyser le Dockerfile
}
```

---

#### **Terminal API**

```typescript
// Créer un terminal
UnityIDE.terminal.create(name: string, options?: TerminalOptions): Terminal

// Obtenir un terminal
UnityIDE.terminal.get(name: string): Terminal | undefined

// Lister tous les terminaux
UnityIDE.terminal.list(): Terminal[]
```

**Terminal Interface :**

```typescript
terminal.sendText(text: string): void
terminal.clear(): void
terminal.dispose(): void
terminal.onData(callback: (data: string) => void): void
terminal.onExit(callback: (code: number) => void): void
```

**Exemple :**

```typescript
const terminal = UnityIDE.terminal.create('docker-build', {
  cwd: UnityIDE.workspace.rootPath
});

terminal.sendText('docker build -t myapp .');

terminal.onExit((code) => {
  if (code === 0) {
    UnityIDE.notifications.success('Build completed!');
  } else {
    UnityIDE.notifications.error('Build failed!');
  }
});
```

---

## 📝 **Extension Manifest**

### **Structure Complète**

```json
{
  "id": "my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Description de l'extension",
  "author": "Author Name",
  "publisher": "publisher-name",
  "main": "dist/extension.js",
  "engines": {
    "unity": "^1.0.0"
  },
  "categories": ["DevOps", "Monitoring"],
  "keywords": ["docker", "kubernetes"],
  "repository": "https://github.com/user/repo",
  "homepage": "https://extension-website.com",
  "license": "MIT",
  "contributes": {
    "commands": [...],
    "views": [...],
    "menus": [...],
    "keybindings": [...],
    "configuration": {...}
  },
  "dependencies": {
    "axios": "^1.0.0"
  }
}
```

### **Contributes**

#### **Commands**

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.deploy",
        "title": "Deploy Application",
        "category": "My Extension",
        "icon": "$(rocket)"
      }
    ]
  }
}
```

#### **Views**

```json
{
  "contributes": {
    "views": [
      {
        "id": "myext-view",
        "name": "My View",
        "type": "tree",
        "contextValue": "myext"
      }
    ]
  }
}
```

#### **Menus**

```json
{
  "contributes": {
    "menus": [
      {
        "id": "editor/context",
        "command": "myext.formatFile",
        "when": "editorFocus",
        "group": "formatting"
      }
    ]
  }
}
```

#### **Keybindings**

```json
{
  "contributes": {
    "keybindings": [
      {
        "key": "ctrl+shift+d",
        "command": "myext.deploy",
        "when": "editorFocus",
        "mac": "cmd+shift+d",
        "linux": "ctrl+shift+d",
        "win": "ctrl+shift+d"
      }
    ]
  }
}
```

#### **Configuration**

```json
{
  "contributes": {
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myext.apiUrl": {
          "type": "string",
          "default": "https://api.example.com",
          "description": "API endpoint URL"
        },
        "myext.timeout": {
          "type": "number",
          "default": 30000,
          "description": "Request timeout in ms"
        },
        "myext.enableFeature": {
          "type": "boolean",
          "default": true,
          "description": "Enable feature X"
        }
      }
    }
  }
}
```

---

## 📤 **Publishing**

### **1. Préparer l'extension**

```bash
# Build
npm run build

# Test
npm test

# Package
npm run package
```

### **2. Publier sur le marketplace**

```bash
# Login
unity-ext login

# Publish
unity-ext publish
```

### **3. Mettre à jour**

```bash
# Bump version
npm version patch

# Publish
unity-ext publish
```

---

## 💡 **Examples**

### **Extension Docker Monitor**

```typescript
import { Extension, ExtensionContext } from '@unity-ide/extension-sdk';

class DockerMonitor extends Extension {
  private interval?: NodeJS.Timeout;

  activate(context: ExtensionContext): void {
    // Commande pour voir les stats
    this.addDisposable(
      window.UnityIDE.commands.register('docker-monitor.showStats', async () => {
        const stats = await this.getContainerStats();
        this.showStatsView(stats);
      })
    );

    // Monitoring automatique
    this.interval = setInterval(() => {
      this.checkContainers();
    }, 30000);

    context.logger.info('Docker Monitor activated');
  }

  deactivate(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private async getContainerStats() {
    const response = await fetch('/api/v1/docker/stats');
    return response.json();
  }

  private async checkContainers() {
    const containers = await this.getContainerStats();
    const unhealthy = containers.filter(c => c.status !== 'running');

    if (unhealthy.length > 0) {
      window.UnityIDE.notifications.warn(
        `${unhealthy.length} containers unhealthy`,
        {
          action: {
            label: 'View Details',
            command: 'docker-monitor.showStats'
          }
        }
      );
    }
  }

  private showStatsView(stats: any) {
    const StatsView = () => (
      <div style={{ padding: '10px' }}>
        <h3>Container Stats</h3>
        {stats.map((stat: any) => (
          <div key={stat.id}>
            <strong>{stat.name}</strong>: {stat.cpu}% CPU, {stat.memory} MB
          </div>
        ))}
      </div>
    );

    window.UnityIDE.views.create('sidebar', 'docker-stats', StatsView);
  }
}

export default (context: ExtensionContext) => new DockerMonitor();
```

---

## 🔒 **Best Practices**

### **1. Error Handling**

```typescript
try {
  await riskyOperation();
} catch (error) {
  context.logger.error('Operation failed', error);
  UnityIDE.notifications.error('Operation failed: ' + error.message);
}
```

### **2. Dispose Resources**

```typescript
const subscription = someObservable.subscribe(data => {
  // handle data
});

this.addDisposable(() => subscription.unsubscribe());
```

### **3. Configuration**

```typescript
// Toujours fournir des valeurs par défaut
const apiUrl = UnityIDE.config.get('myext.apiUrl', 'https://default.api.com');
```

### **4. Logging**

```typescript
// Utiliser les niveaux appropriés
context.logger.debug('Detailed info');
context.logger.info('General info');
context.logger.warn('Warning');
context.logger.error('Error occurred');
```

---

## 📞 **Support**

- 📚 **Docs** : [docs.unity-ide.dev/extensions](https://docs.unity-ide.dev/extensions)
- 💬 **Discord** : [discord.gg/unity-ide](https://discord.gg/unity-ide)
- 🐛 **Issues** : [GitHub Issues](https://github.com/flori92/Unity-IDE/issues)
- 📧 **Email** : extensions@unity-ide.dev

---

**Unity IDE Extension SDK - Build Amazing Extensions ! 🔌✨**
