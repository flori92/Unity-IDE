// Mode K9s intégré - Raccourcis clavier et fonctionnalités avancées
// import { mockBackend } from './mockBackendService'; // Not used in this file

export class K9sIntegration {
  private shortcuts: Map<string, () => void> = new Map();
  private terminalMode: boolean = false;
  private currentNamespace: string = 'default';
  private currentView: string = 'pods';

  constructor() {
    this.initializeShortcuts();
  }

  // Raccourcis clavier inspirés de K9s
  private initializeShortcuts() {
    // Navigation K9s-like
    this.shortcuts.set(':', () => this.enterCommandMode());
    this.shortcuts.set('/', () => this.enterFilterMode());
    this.shortcuts.set('h', () => this.showHelp());
    this.shortcuts.set('q', () => this.quit());
    this.shortcuts.set('Ctrl+c', () => this.quit());
    this.shortcuts.set('Esc', () => this.exitMode());

    // Vues principales (comme K9s)
    this.shortcuts.set('0', () => this.switchView('overview'));
    this.shortcuts.set('1', () => this.switchView('pods'));
    this.shortcuts.set('2', () => this.switchView('services'));
    this.shortcuts.set('3', () => this.switchView('deployments'));
    this.shortcuts.set('4', () => this.switchView('containers'));
    this.shortcuts.set('5', () => this.switchView('namespaces'));

    // Actions rapides (comme K9s)
    this.shortcuts.set('Enter', () => this.selectItem());
    this.shortcuts.set('l', () => this.viewLogs());
    this.shortcuts.set('d', () => this.describe());
    this.shortcuts.set('e', () => this.edit());
    this.shortcuts.set('k', () => this.delete());
    this.shortcuts.set('s', () => this.scale());

    // Navigation (comme K9s)
    this.shortcuts.set('j', () => this.moveDown());
    this.shortcuts.set('k', () => this.moveUp());
    this.shortcuts.set('g', () => this.goToTop());
    this.shortcuts.set('G', () => this.goToBottom());
    this.shortcuts.set('n', () => this.nextNamespace());
    this.shortcuts.set('p', () => this.previousNamespace());

    // Actions spéciales
    this.shortcuts.set('Ctrl+r', () => this.refresh());
    this.shortcuts.set('Ctrl+f', () => this.toggleFullScreen());
    this.shortcuts.set('Ctrl+t', () => this.toggleTerminal());
  }

  // Gestionnaire d'événements clavier
  handleKeyPress(event: KeyboardEvent): boolean {
    const key = this.buildKeyString(event);

    if (this.shortcuts.has(key)) {
      event.preventDefault();
      this.shortcuts.get(key)!();
      return true;
    }

    return false;
  }

  private buildKeyString(event: KeyboardEvent): string {
    let key = '';

    if (event.ctrlKey) {
      key += 'Ctrl+';
    }
    if (event.altKey) {
      key += 'Alt+';
    }
    if (event.shiftKey) {
      key += 'Shift+';
    }
    if (event.metaKey) {
      key += 'Meta+';
    }

    key += event.key;

    return key;
  }

  // Mode commande (comme K9s)
  private enterCommandMode() {
    this.terminalMode = true;
    console.log('[K9s] Command mode: Type a command or press Esc to exit');
    // TODO: Afficher une barre de commande dans l'interface
  }

  // Mode filtre (comme K9s)
  private enterFilterMode() {
    console.log('[K9s] Filter mode: Type to filter resources');
    // TODO: Afficher une barre de filtre
  }

  // Actions principales
  private switchView(view: string) {
    this.currentView = view;
    console.log(`[K9s] Switched to ${view} view`);

    // Déclencher le changement de vue dans l'interface
    window.dispatchEvent(new CustomEvent('k9s-view-change', {
      detail: { view, namespace: this.currentNamespace }
    }));
  }

  private selectItem() {
    console.log('[K9s] Selected current item');
    // TODO: Ouvrir le détail de l'élément sélectionné
  }

  private viewLogs() {
    console.log('[K9s] Viewing logs for selected item');
    // TODO: Ouvrir les logs dans un terminal intégré
  }

  private describe() {
    console.log('[K9s] Describing selected item');
    // TODO: Afficher les détails YAML/JSON
  }

  private edit() {
    console.log('[K9s] Editing selected item');
    // TODO: Ouvrir l'éditeur intégré
  }

  private delete() {
    if (confirm('[K9s] Delete selected item? (y/N)')) {
      console.log('[K9s] Deleting selected item');
      // TODO: Supprimer l'élément
    }
  }

  private scale() {
    const replicas = prompt('[K9s] Scale to how many replicas?');
    if (replicas) {
      console.log(`[K9s] Scaling to ${replicas} replicas`);
    }
  }

  // Navigation
  private moveUp() {
    window.dispatchEvent(new CustomEvent('k9s-navigate', { detail: { direction: 'up' } }));
  }

  private moveDown() {
    window.dispatchEvent(new CustomEvent('k9s-navigate', { detail: { direction: 'down' } }));
  }

  private goToTop() {
    window.dispatchEvent(new CustomEvent('k9s-navigate', { detail: { action: 'top' } }));
  }

  private goToBottom() {
    window.dispatchEvent(new CustomEvent('k9s-navigate', { detail: { action: 'bottom' } }));
  }

  private nextNamespace() {
    // TODO: Passer au namespace suivant
    console.log('[K9s] Next namespace');
  }

  private previousNamespace() {
    // TODO: Passer au namespace précédent
    console.log('[K9s] Previous namespace');
  }

  // Utilitaires
  private refresh() {
    console.log('[K9s] Refreshing data');
    window.dispatchEvent(new CustomEvent('k9s-refresh'));
  }

  private toggleFullScreen() {
    console.log('[K9s] Toggling fullscreen');
    // TODO: Basculer en mode plein écran
  }

  private toggleTerminal() {
    this.terminalMode = !this.terminalMode;
    console.log(`[K9s] Terminal mode: ${this.terminalMode ? 'ON' : 'OFF'}`);
    // TODO: Basculer l'affichage du terminal intégré
  }

  private showHelp() {
    console.log('[K9s] Help - Available shortcuts:');
    console.log('Navigation: j/k (down/up), g/G (top/bottom)');
    console.log('Views: 0-5 (overview to namespaces)');
    console.log('Actions: Enter (select), l (logs), d (describe), e (edit)');
    console.log('Commands: : (command mode), / (filter), h (help)');
    console.log('System: Ctrl+r (refresh), Ctrl+t (terminal), q (quit)');
  }

  private quit() {
    if (confirm('[K9s] Quit Unity DevOps IDE?')) {
      window.close();
    }
  }

  private exitMode() {
    this.terminalMode = false;
    console.log('[K9s] Exited special mode');
  }

  // API publique
  public getCurrentView(): string {
    return this.currentView;
  }

  public getCurrentNamespace(): string {
    return this.currentNamespace;
  }

  public isTerminalMode(): boolean {
    return this.terminalMode;
  }

  public setNamespace(namespace: string) {
    this.currentNamespace = namespace;
    console.log(`[K9s] Switched to namespace: ${namespace}`);
  }
}

// Instance globale
export const k9sIntegration = new K9sIntegration();

// Initialisation globale des raccourcis
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', (event) => {
    k9sIntegration.handleKeyPress(event);
  });

  // Message d'accueil K9s-like
  console.log(`
🐶 Unity DevOps IDE - K9s Mode Activated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Welcome to the most advanced DevOps IDE!

Navigation:
  j/k     - Navigate up/down
  g/G     - Go to top/bottom
  0-5     - Switch views (overview to namespaces)
  :       - Command mode
  /       - Filter mode
  h       - Show help
  q       - Quit

Actions:
  Enter   - Select item
  l       - View logs
  d       - Describe resource
  e       - Edit resource
  k       - Delete resource
  s       - Scale deployment

Try pressing 'h' for more shortcuts!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
