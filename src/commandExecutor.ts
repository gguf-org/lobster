import * as vscode from 'vscode';
import * as os from 'os';
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

export class CommandExecutor {
    private terminal: vscode.Terminal | undefined;
    private ggcTerminal: vscode.Terminal | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        // Clean up terminals on close
        vscode.window.onDidCloseTerminal((closedTerminal) => {
            if (this.terminal && closedTerminal === this.terminal) {
                this.terminal = undefined;
            }
            if (this.ggcTerminal && closedTerminal === this.ggcTerminal) {
                this.ggcTerminal = undefined;
            }
        });
    }

    async executeCommand(command: string) {
        try {
            const platform = os.platform();
            const isWindows = platform === 'win32';

            // Special handling for ggc oc
            if (command === 'ggc oc') {
                if (!this.ggcTerminal) {
                    this.ggcTerminal = vscode.window.createTerminal({
                        name: 'Magnet'
                    });
                }
                this.ggcTerminal.show(true);
                this.ggcTerminal.sendText(command);
                return;
            }

            const useWsl = isWindows;

            // Create or reuse terminal
            if (!this.terminal) {
                if (useWsl) {
                    this.terminal = vscode.window.createTerminal({
                        name: 'Lobster',
                        shellPath: 'wsl.exe',
                        shellArgs: ['-d', 'Ubuntu']
                    });
                } else {
                    this.terminal = vscode.window.createTerminal({
                        name: 'Lobster'
                    });
                }
            }

            // Show terminal and send command
            this.terminal.show(true);
            this.terminal.sendText(command);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to execute ${command}: ${error}`);
        }
    }

    async checkPackage() {
        const isWindows = os.platform() === 'win32';

        const npmListCmd = isWindows ? 'wsl -d Ubuntu npm list -g openclaw --json --depth=0' : 'npm list -g openclaw --json --depth=0';
        const npmViewCmd = isWindows ? 'wsl -d Ubuntu npm view openclaw version' : 'npm view openclaw version';

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking openclaw package...",
            cancellable: false
        }, async (progress) => {
            try {
                // Check installed version
                let installedVersion: string | null = null;
                try {
                    const { stdout } = await exec(npmListCmd);
                    const result = JSON.parse(stdout);
                    if (result.dependencies && result.dependencies.openclaw) {
                        installedVersion = result.dependencies.openclaw.version;
                    }
                } catch (e) {
                    // Package not installed
                }

                if (!installedVersion) {
                    const selection = await vscode.window.showWarningMessage(
                        'Openclaw is not installed.',
                        'Install Openclaw'
                    );
                    if (selection === 'Install Openclaw') {
                        await this.executeCommand('npm install -g openclaw');
                    }
                    return;
                }

                // Check latest version
                let latestVersion = '';
                try {
                    const { stdout } = await exec(npmViewCmd);
                    latestVersion = stdout.trim();
                } catch (e) {
                    vscode.window.showErrorMessage('Failed to check latest version from npm.');
                    return;
                }

                if (latestVersion && this.isOlder(installedVersion, latestVersion)) {
                    const selection = await vscode.window.showInformationMessage(
                        `Openclaw update available (Current: ${installedVersion}, Latest: ${latestVersion})`,
                        'Update Openclaw'
                    );
                    if (selection === 'Update Openclaw') {
                        await this.executeCommand('npm update -g openclaw');
                    }
                } else {
                    vscode.window.showInformationMessage(`Openclaw is up to date (v${installedVersion}).`);
                }

            } catch (err) {
                vscode.window.showErrorMessage(`Error checking openclaw package: ${err}`);
            }
        });
    }

    private isOlder(current: string, latest: string): boolean {
        const parse = (v: string) => {
            v = v.replace(/^v/, '');
            const hyphenIndex = v.indexOf('-');
            let coreStr = v;
            let pre = '';
            if (hyphenIndex !== -1) {
                coreStr = v.substring(0, hyphenIndex);
                pre = v.substring(hyphenIndex + 1);
            }
            const core = coreStr.split('.').map(n => parseInt(n, 10));
            return { core, pre };
        };

        const v1 = parse(current);
        const v2 = parse(latest);

        for (let i = 0; i < Math.max(v1.core.length, v2.core.length); i++) {
            const a = v1.core[i];
            const b = v2.core[i];

            const numA = isNaN(a) ? 0 : a;
            const numB = isNaN(b) ? 0 : b;

            if (numA < numB) return true;
            if (numA > numB) return false;
        }

        if (v1.pre && !v2.pre) return true;
        if (!v1.pre && v2.pre) return false;

        if (v1.pre && v2.pre) {
            return v1.pre < v2.pre;
        }

        return false;
    }
}
