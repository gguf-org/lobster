import { Counter } from './counters';
import { Lobster } from './lobster';

// Declare vscode API
declare const acquireVsCodeApi: any;

export class UI {
    private interactionPrompt: HTMLElement;
    private dialogueBox: HTMLElement;
    private dialogueTitle: HTMLElement;
    private dialogueText: HTMLElement;
    private dialogueOptions: HTMLElement;
    private vscode: any;

    constructor() {
        this.interactionPrompt = document.getElementById('interaction-prompt')!;
        this.dialogueBox = document.getElementById('dialogue-box')!;
        this.dialogueTitle = document.getElementById('dialogue-title')!;
        this.dialogueText = document.getElementById('dialogue-text')!;
        this.dialogueOptions = document.getElementById('dialogue-options')!;
        
        // Acquire VS Code API
        this.vscode = acquireVsCodeApi();
    }

    public showInteractionPrompt(show: boolean): void {
        if (show) {
            this.interactionPrompt.classList.add('visible');
        } else {
            this.interactionPrompt.classList.remove('visible');
        }
    }

    public showDialogue(title: string, text: string, options: Array<{ text: string, action: () => void }>): void {
        this.dialogueTitle.textContent = title;
        this.dialogueText.textContent = text;
        this.dialogueOptions.innerHTML = '';

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dialogue-option';
            optionDiv.textContent = option.text;
            optionDiv.onclick = option.action;
            this.dialogueOptions.appendChild(optionDiv);
        });

        this.dialogueBox.classList.add('visible');
    }

    public hideDialogue(): void {
        this.dialogueBox.classList.remove('visible');
    }

    public sendCommand(command: string): void {
        this.vscode.postMessage({
            type: 'executeCommand',
            command: command
        });
    }

    public sendCheckPackage(): void {
        this.vscode.postMessage({
            type: 'checkPackage'
        });
    }

    public sendShowSubmenu(counter: string, options: string[]): void {
        this.vscode.postMessage({
            type: 'showSubmenu',
            counter: counter,
            options: options
        });
    }
}
