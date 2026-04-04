import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

export enum IAction {
	SKIP = "s",
	UPDATE = "u",
	CONFIRM = "y",
	DENY = "n",
	RETRY = "r"
};

export class CommandLineService {

	public getInput = async (message: string) => {
		const rl = readline.createInterface({ input, output });
		const response = await rl.question(`${message}${this.skipLine(1)}`);
		rl.close();
		return response.trim();
	}

	public getAction = async (prompt: string): Promise<IAction> => {
		const response = (await this.getInput(prompt)).toLowerCase();

		let action: IAction;
		switch (response) {
			case IAction.SKIP:
				action = IAction.SKIP;
				break;
			case IAction.UPDATE:
				action = IAction.UPDATE;
				break;
			case IAction.RETRY:
				action = IAction.RETRY;
				break;
			case IAction.CONFIRM:
				action = IAction.CONFIRM;
				break;
			case IAction.DENY:
				action = IAction.DENY;
				break;
			default:
				console.log("Unrecognized command. Please try again.")
				action = await this.getAction(prompt);
		}

		return action;
	}

	public confirm = async (message: string): Promise<boolean> => {
		const response = await this.getAction(message + "\n (Y)es or (N)o?");
		if (response == IAction.CONFIRM) {
			return true;
		}
		return false;
	}

	skipLine = (lines: number): string => {
		let indentation = "\n";
		for (let i = 1; i < lines; i++) {
			indentation += "\n";
		}

		return indentation;
	}

	getNewValue = async (field: string) => {
		const value = await this.getInput(`Provide the new ${field}:`);
		console.log(`New ${field}: ${value}`)

		return value;
	}
}