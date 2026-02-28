import { Counters, Counter } from './counters';
import { Lobster } from './lobster';
import { UI } from './ui';

export class InteractionSystem {
    private counters: Counters;
    private lobster: Lobster;
    private ui: UI;
    private dialogueActive: boolean = false;
    private currentCounter: Counter | null = null;

    constructor(counters: Counters, lobster: Lobster, ui: UI) {
        this.counters = counters;
        this.lobster = lobster;
        this.ui = ui;
    }

    public update(nearestCounter: Counter | null): void {
        // Show/hide interaction prompt
        if (nearestCounter && !this.dialogueActive) {
            this.ui.showInteractionPrompt(true);
            
            // Check for interact key
            if (this.lobster.isInteracting()) {
                this.lobster.resetInteract();
                this.startInteraction(nearestCounter);
            }
        } else if (!this.dialogueActive) {
            this.ui.showInteractionPrompt(false);
        }
    }

    private startInteraction(counter: Counter): void {
        this.currentCounter = counter;
        this.dialogueActive = true;

        // Check if commands is an array or object
        if (Array.isArray(counter.commands)) {
            // Single command - execute directly
            const command = counter.commands[0];
            if (command === 'check-package') {
                this.ui.sendCheckPackage();
                this.endInteraction();
            } else {
                this.ui.sendCommand(command);
                this.endInteraction();
            }
        } else {
            // Multiple commands - show menu
            const options = Object.keys(counter.commands).map(key => ({
                text: key,
                action: () => this.executeCounterCommand(key)
            }));

            options.push({
                text: 'Cancel',
                action: () => this.endInteraction()
            });

            this.ui.showDialogue(
                counter.name,
                counter.description,
                options
            );
        }
    }

    private executeCounterCommand(commandKey: string): void {
        if (!this.currentCounter || Array.isArray(this.currentCounter.commands)) {
            return;
        }

        const command = this.currentCounter.commands[commandKey];
        
        if (command === 'pairing-menu') {
            // Special handling for pairing menu
            this.ui.showDialogue(
                'Pairing Menu',
                'Select an app to pair',
                [
                    { text: 'Telegram', action: () => this.executePairing('telegram') },
                    { text: 'WhatsApp', action: () => this.executePairing('whatsapp') },
                    { text: 'Signal', action: () => this.executePairing('signal') },
                    { text: 'Discord', action: () => this.executePairing('discord') },
                    { text: 'Slack', action: () => this.executePairing('slack') },
                    { text: 'Cancel', action: () => this.endInteraction() }
                ]
            );
        } else {
            this.ui.sendCommand(command);
            this.endInteraction();
        }
    }

    private executePairing(app: string): void {
        // For pairing, we'd need a code input dialog
        // For now, just show a message
        this.ui.showDialogue(
            'Pairing',
            `Pairing with ${app}. Please enter the pairing code in the terminal when prompted.`,
            [
                { text: 'OK', action: () => {
                    this.ui.sendCommand(`openclaw pairing approve ${app}`);
                    this.endInteraction();
                }}
            ]
        );
    }

    private endInteraction(): void {
        this.dialogueActive = false;
        this.currentCounter = null;
        this.ui.hideDialogue();
    }

    public isDialogueActive(): boolean {
        return this.dialogueActive;
    }
}
