# DevOps Unity IDE Extension Development Guide

## 🚀 Getting Started

DevOps Unity IDE supports a powerful extension system that allows developers to extend the functionality of the IDE with custom features, integrations, and tools.

## 📦 Extension Structure

Every extension must have the following structure:

```
my-extension/
├── package.json         # Extension manifest
├── src/
│   └── extension.ts    # Main extension code
├── dist/               # Compiled JavaScript
├── resources/          # Icons, images, etc.
└── README.md          # Extension documentation
```

## 📝 Extension Manifest (package.json)

The `package.json` file describes your extension and its capabilities:

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "version": "1.0.0",
  "description": "Description of my extension",
  "publisher": "your-name",
  "main": "./dist/extension.js",
  "engines": {
    "devopsUnity": "^1.0.0"
  },
  "categories": ["Docker", "Kubernetes", "Cloud"],
  "activationEvents": [
    "onCommand:myExtension.start"
  ],
  "contributes": {
    "commands": [
      {
        "command": "myExtension.start",
        "title": "Start My Extension",
        "category": "My Extension"
      }
    ]
  }
}
```

## 🔧 Extension API

### Available Namespaces

- **commands**: Register and execute commands
- **window**: UI interactions (messages, inputs, outputs)
- **workspace**: Workspace configuration and files
- **docker**: Docker container management
- **kubernetes**: Kubernetes cluster operations
- **ansible**: Ansible playbook execution
- **storage**: Persistent storage for extension data

### Basic Extension Example

```typescript
// The 'du' object is injected by the runtime
declare const du: any;

export function activate(context: ExtensionContext) {
  console.log('Extension activated!');
  
  // Register a command
  const disposable = du.commands.registerCommand('myExtension.helloWorld', () => {
    du.window.showInformationMessage('Hello World!');
  });
  
  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log('Extension deactivated');
}
```

## 🐳 Docker Integration

```typescript
// List all containers
const containers = await du.docker.listContainers();

// Start a container
await du.docker.startContainer(containerId);

// Execute command in container
const output = await du.docker.executeCommand(containerId, ['ls', '-la']);
```

## ☸️ Kubernetes Integration

```typescript
// List pods in namespace
const pods = await du.kubernetes.listPods('default');

// Apply manifest
await du.kubernetes.applyManifest(yamlContent);

// Port forward
const forward = await du.kubernetes.portForward('my-pod', 8080, 80);
```

## 🎭 Ansible Integration

```typescript
// Run playbook
const result = await du.ansible.runPlaybook('site.yml', 'inventory');

// Encrypt with Ansible Vault
const encrypted = await du.ansible.encryptVault(content, password);
```

## 💾 Storage API

```typescript
// Save data
du.storage.set('myKey', { data: 'value' });

// Retrieve data
const data = du.storage.get('myKey');

// Delete data
du.storage.delete('myKey');
```

## 🎨 UI Components

### Output Channel
```typescript
const output = du.window.createOutputChannel('My Extension');
output.show();
output.appendLine('Extension output');
```

### Status Bar
```typescript
const statusBar = du.window.createStatusBarItem();
statusBar.text = '$(gear) My Extension';
statusBar.tooltip = 'Click to activate';
statusBar.command = 'myExtension.activate';
statusBar.show();
```

### Quick Pick
```typescript
const selected = await du.window.showQuickPick(['Option 1', 'Option 2'], {
  placeHolder: 'Select an option'
});
```

### Input Box
```typescript
const input = await du.window.showInputBox({
  prompt: 'Enter your name',
  placeHolder: 'Name',
  validateInput: (value) => {
    return value.length < 3 ? 'Name must be at least 3 characters' : undefined;
  }
});
```

## 📋 Extension Capabilities

### Commands
Commands that users can execute from the command palette or UI.

### Views
Custom views in the sidebar or panel.

### Configuration
Extension-specific settings that users can configure.

### Themes
Custom color themes for the IDE.

### Languages
Support for new programming languages.

### Snippets
Code snippets for productivity.

## 🔐 Permissions

Extensions must declare required permissions in their manifest:

- `filesystem`: Read/write files
- `network`: Make network requests
- `credentials`: Access stored credentials
- `docker`: Interact with Docker
- `kubernetes`: Access Kubernetes
- `ansible`: Execute Ansible commands
- `system`: System information
- `clipboard`: Clipboard access
- `notifications`: Show notifications

## 🏗️ Building Your Extension

1. **Setup TypeScript**:
```bash
npm install -D typescript @types/node
```

2. **Create tsconfig.json**:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "dist",
    "sourceMap": true,
    "strict": false
  }
}
```

3. **Compile**:
```bash
npx tsc
```

## 📦 Publishing Your Extension

1. Package your extension into a `.vsix` file
2. Submit to the DevOps Unity Marketplace
3. Users can install directly from the IDE

## 🧪 Testing Your Extension

1. Use the Extension Development Host
2. Load your extension locally
3. Test all commands and features
4. Check for memory leaks

## 📚 Examples

Check the `examples/` folder for complete extension examples:

- **hello-world**: Basic extension structure
- **aws-toolkit**: AWS integration with multiple services
- **docker-manager**: Advanced Docker management
- **k8s-dashboard**: Kubernetes cluster visualization

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting extensions to the marketplace.

## 📄 License

Extensions can use any license. We recommend MIT or Apache 2.0 for open source extensions.

## 🔗 Resources

- [Extension API Reference](./sdk/extension-api.d.ts)
- [Extension Examples](./examples/)
- [DevOps Unity IDE Documentation](../README.md)
- [Support Forum](https://github.com/flori92/Unity-IDE/discussions)

## 💡 Tips

1. Keep extensions focused on a single purpose
2. Use async/await for all API calls
3. Properly dispose resources in deactivate()
4. Handle errors gracefully
5. Provide clear documentation
6. Test on all supported platforms
7. Follow semantic versioning
8. Include helpful error messages
