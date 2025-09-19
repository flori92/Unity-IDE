/**
 * Hello World Extension for DevOps Unity IDE
 * 
 * This is a simple example showing how to create an extension
 */

// The extension API will be injected by the runtime
declare const du: any;

interface ExtensionContext {
  extensionPath: string;
  globalState: any;
  workspaceState: any;
  subscriptions: Array<{ dispose: () => void }>;
}

/**
 * This method is called when your extension is activated
 */
export function activate(context: ExtensionContext) {
  console.log('Hello World extension is now active!');

  // Register a command
  const disposable = du.commands.registerCommand('helloWorld.sayHello', () => {
    // Show a message box to the user
    du.window.showInformationMessage('Hello from DevOps Unity IDE!');
    
    // You can also show different types of messages
    du.window.showWarningMessage('This is a warning message');
    
    // Create an output channel
    const outputChannel = du.window.createOutputChannel('Hello World');
    outputChannel.show();
    outputChannel.appendLine('Hello World extension executed!');
    outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    
    // Example of using quick pick
    du.window.showQuickPick(['Option 1', 'Option 2', 'Option 3'], {
      placeHolder: 'Select an option'
    }).then((selection: string | undefined) => {
      if (selection) {
        du.window.showInformationMessage(`You selected: ${selection}`);
      }
    });
    
    // Example of input box
    du.window.showInputBox({
      prompt: 'What is your name?',
      placeHolder: 'Enter your name'
    }).then((name: string | undefined) => {
      if (name) {
        du.window.showInformationMessage(`Hello, ${name}!`);
      }
    });
  });

  // Add to subscriptions so it gets disposed when extension is deactivated
  context.subscriptions.push(disposable);
  
  // Create a status bar item
  const statusBarItem = du.window.createStatusBarItem(1, 100);
  statusBarItem.text = '$(heart) Hello World';
  statusBarItem.tooltip = 'Click to say hello';
  statusBarItem.command = 'helloWorld.sayHello';
  statusBarItem.show();
  
  context.subscriptions.push(statusBarItem);

  // Example of Docker integration
  const dockerCommand = du.commands.registerCommand('helloWorld.listContainers', async () => {
    try {
      const containers = await du.docker.listContainers();
      du.window.showInformationMessage(`Found ${containers.length} Docker containers`);
      
      const outputChannel = du.window.createOutputChannel('Docker Containers');
      outputChannel.show();
      containers.forEach((container: any) => {
        outputChannel.appendLine(`- ${container.name}: ${container.state}`);
      });
    } catch (error) {
      du.window.showErrorMessage(`Failed to list containers: ${error}`);
    }
  });
  
  context.subscriptions.push(dockerCommand);

  // Example of Kubernetes integration
  const k8sCommand = du.commands.registerCommand('helloWorld.listPods', async () => {
    try {
      const pods = await du.kubernetes.listPods();
      du.window.showInformationMessage(`Found ${pods.length} Kubernetes pods`);
      
      const outputChannel = du.window.createOutputChannel('Kubernetes Pods');
      outputChannel.show();
      pods.forEach((pod: any) => {
        outputChannel.appendLine(`- ${pod.name} (${pod.namespace}): ${pod.status}`);
      });
    } catch (error) {
      du.window.showErrorMessage(`Failed to list pods: ${error}`);
    }
  });
  
  context.subscriptions.push(k8sCommand);

  // Example of using storage
  const storageExample = du.commands.registerCommand('helloWorld.saveData', () => {
    const data = {
      timestamp: new Date().toISOString(),
      message: 'Hello from extension storage!'
    };
    
    // Save data
    du.storage.set('hello-world-data', data);
    du.window.showInformationMessage('Data saved to storage');
    
    // Retrieve data
    const savedData = du.storage.get('hello-world-data');
    console.log('Retrieved data:', savedData);
  });
  
  context.subscriptions.push(storageExample);

  // Example of workspace configuration
  const config = du.workspace.getConfiguration('helloWorld');
  const greeting = config.get('greeting', 'Hello');
  console.log('Configured greeting:', greeting);
  
  // Listen for configuration changes
  const configListener = du.workspace.onDidChangeConfiguration((e: any) => {
    if (e.affectsConfiguration('helloWorld')) {
      du.window.showInformationMessage('Hello World configuration changed!');
    }
  });
  
  context.subscriptions.push(configListener);
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  console.log('Hello World extension is now deactivated');
}
