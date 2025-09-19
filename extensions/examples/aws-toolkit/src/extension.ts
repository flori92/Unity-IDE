import * as du from '@devops-unity/extension-sdk';
import { EC2Client } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { LambdaClient } from '@aws-sdk/client-lambda';

let ec2Client: EC2Client;
let s3Client: S3Client;
let lambdaClient: LambdaClient;

export function activate(context: du.ExtensionContext) {
  console.log('AWS Toolkit extension is now active!');

  // Initialize AWS clients
  const region = du.workspace.getConfiguration('aws').get('region', 'us-east-1');
  
  ec2Client = new EC2Client({ region });
  s3Client = new S3Client({ region });
  lambdaClient = new LambdaClient({ region });

  // Register commands
  const connectCommand = du.commands.registerCommand('aws.connect', async () => {
    const profile = await du.window.showInputBox({
      prompt: 'Enter AWS Profile name',
      value: 'default',
      placeHolder: 'default'
    });

    if (profile) {
      du.window.showInformationMessage(`Connected to AWS profile: ${profile}`);
      
      // Update configuration
      await du.workspace.getConfiguration('aws').update('profile', profile);
    }
  });

  const deployCommand = du.commands.registerCommand('aws.deploy', async () => {
    const options = ['CloudFormation', 'ECS', 'Lambda', 'S3'];
    const deployment = await du.window.showQuickPick(options, {
      placeHolder: 'Select deployment target'
    });

    if (deployment) {
      const outputChannel = du.window.createOutputChannel('AWS Deployment');
      outputChannel.show();
      outputChannel.appendLine(`Starting deployment to ${deployment}...`);
      
      // Simulate deployment progress
      outputChannel.appendLine('Creating resources...');
      await sleep(1000);
      outputChannel.appendLine('Uploading artifacts...');
      await sleep(1000);
      outputChannel.appendLine('Configuring services...');
      await sleep(1000);
      outputChannel.appendLine('✅ Deployment successful!');
      
      du.window.showInformationMessage(`Successfully deployed to ${deployment}`);
    }
  });

  const s3UploadCommand = du.commands.registerCommand('aws.s3.upload', async () => {
    // List S3 buckets
    try {
      const data = await s3Client.send(new ListBucketsCommand({}));
      const buckets = data.Buckets?.map(b => b.Name || '') || [];
      
      const selectedBucket = await du.window.showQuickPick(buckets, {
        placeHolder: 'Select S3 bucket'
      });

      if (selectedBucket) {
        du.window.showInformationMessage(`Uploading to S3 bucket: ${selectedBucket}`);
        // Implement actual upload logic here
      }
    } catch (error) {
      du.window.showErrorMessage(`Failed to list S3 buckets: ${error}`);
    }
  });

  const lambdaCreateCommand = du.commands.registerCommand('aws.lambda.create', async () => {
    const functionName = await du.window.showInputBox({
      prompt: 'Enter Lambda function name',
      placeHolder: 'my-function',
      validateInput: (value) => {
        if (!value || value.length < 3) {
          return 'Function name must be at least 3 characters';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return 'Function name can only contain letters, numbers, hyphens, and underscores';
        }
        return undefined;
      }
    });

    if (functionName) {
      const runtime = await du.window.showQuickPick([
        'nodejs18.x',
        'nodejs16.x',
        'python3.10',
        'python3.9',
        'java11',
        'go1.x',
        'dotnet6'
      ], {
        placeHolder: 'Select runtime'
      });

      if (runtime) {
        du.window.showInformationMessage(`Creating Lambda function: ${functionName} with runtime ${runtime}`);
        // Implement actual Lambda creation logic here
      }
    }
  });

  // Create status bar item
  const statusBar = du.window.createStatusBarItem(du.StatusBarAlignment.Right, 100);
  statusBar.text = '$(cloud) AWS: Connected';
  statusBar.tooltip = 'AWS Toolkit - Click to view status';
  statusBar.command = 'aws.showStatus';
  statusBar.show();

  // Register status command
  const statusCommand = du.commands.registerCommand('aws.showStatus', () => {
    const panel = du.window.createWebviewPanel(
      'awsStatus',
      'AWS Status',
      du.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = getStatusWebviewContent();
  });

  // Add to subscriptions
  context.subscriptions.push(
    connectCommand,
    deployCommand,
    s3UploadCommand,
    lambdaCreateCommand,
    statusCommand,
    statusBar
  );

  // Create AWS Explorer view
  createAWSExplorer(context);
}

export function deactivate() {
  console.log('AWS Toolkit extension is now deactivated');
}

function createAWSExplorer(context: du.ExtensionContext) {
  // This would create a tree view in the explorer
  // For now, we'll just log it
  console.log('AWS Explorer initialized');
}

function getStatusWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS Status</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #cccccc;
        }
        h1 {
            color: #ff9900;
        }
        .service {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            margin: 10px 0;
            background: #2d2d2d;
            border-radius: 5px;
        }
        .status {
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.active {
            background: #4caf50;
            color: white;
        }
        .status.inactive {
            background: #f44336;
            color: white;
        }
    </style>
</head>
<body>
    <h1>AWS Services Status</h1>
    <div class="service">
        <span>EC2</span>
        <span class="status active">ACTIVE</span>
    </div>
    <div class="service">
        <span>S3</span>
        <span class="status active">ACTIVE</span>
    </div>
    <div class="service">
        <span>Lambda</span>
        <span class="status active">ACTIVE</span>
    </div>
    <div class="service">
        <span>CloudFormation</span>
        <span class="status active">ACTIVE</span>
    </div>
    <div class="service">
        <span>RDS</span>
        <span class="status inactive">NOT CONFIGURED</span>
    </div>
</body>
</html>`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
