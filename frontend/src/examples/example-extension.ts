/**
 * Exemple d'extension Unity IDE
 *
 * Cette extension ajoute une commande "Hello World" et une vue personnalisée
 */

import { createExtension, Extension, ExtensionContext, createCommand, createView } from '../sdk/extension-sdk';

// Manifest de l'extension
const manifest = {
  id: 'example-extension',
  name: 'Example Extension',
  version: '1.0.0',
  description: 'Exemple d\'extension pour Unity IDE',
  author: 'Unity Team',
  publisher: 'unity-ide',
  main: 'dist/extension.js',
  engines: {
    unity: '^1.0.0'
  },
  contributes: {
    commands: [
      {
        command: 'example.helloWorld',
        title: 'Hello World',
        category: 'Example'
      }
    ],
    views: [
      {
        id: 'exampleView',
        name: 'Example View',
        type: 'tree'
      }
    ],
    menus: [
      {
        command: 'example.helloWorld',
        when: 'view == exampleView'
      }
    ],
    keybindings: [
      {
        key: 'ctrl+shift+h',
        command: 'example.helloWorld',
        when: 'editorFocus'
      }
    ],
    configuration: {
      title: 'Example Extension',
      properties: {
        'example.greeting': {
          type: 'string',
          default: 'Hello',
          description: 'The greeting to use'
        }
      }
    }
  }
};

// Composant React pour la vue personnalisée
const ExampleView = () => {
  return (
    <div style={{ padding: '10px' }}>
      <h3>Example Extension View</h3>
      <p>Cette vue est fournie par l'extension exemple.</p>
      <button onClick={() => {
        if (window.UnityIDE) {
          window.UnityIDE.commands.execute('example.helloWorld');
        }
      }}>
        Cliquez pour dire Hello World
      </button>
    </div>
  );
};

// Classe principale de l'extension
class ExampleExtension extends Extension {
  activate(context: ExtensionContext): void {
    // Enregistrer la commande
    this.addDisposable(
      window.UnityIDE.commands.register('example.helloWorld', () => {
        const greeting = window.UnityIDE.config.get('example.greeting', 'Hello');
        window.UnityIDE.notifications.info(`${greeting} World from Example Extension!`);
      })
    );

    // Créer la vue
    this.addDisposable(
      window.UnityIDE.views.create('sidebar', 'exampleView', ExampleView)
    );

    // Écouter les changements de configuration
    this.addDisposable(
      window.UnityIDE.config.onChange((key, value) => {
        if (key === 'example.greeting') {
          context.logger.info(`Greeting changed to: ${value}`);
        }
      })
    );

    // Logger l'activation
    context.logger.info('Example Extension activated');
  }

  deactivate(): void {
    // Nettoyage automatique géré par la classe parente
  }
}

// Exporter l'extension
createExtension(manifest, (context) => new ExampleExtension());

// Export par défaut pour les outils de build
export default manifest;
