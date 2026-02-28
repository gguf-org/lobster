import * as vscode from 'vscode';
import { GamePanel } from './gamePanel';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('Lobster Game extension is now active');

    // Create status bar item with lobster/game icon
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'lobsterGame.openGame';
    statusBarItem.text = '$(game) Lobster';
    statusBarItem.tooltip = 'Click to open Lobster Game';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register command to open game
    const openGameCommand = vscode.commands.registerCommand('lobsterGame.openGame', () => {
        GamePanel.createOrShow(context);
    });
    context.subscriptions.push(openGameCommand);
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
