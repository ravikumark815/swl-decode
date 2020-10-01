import * as vscode from 'vscode';
import { print } from 'util';

export function activate(context: vscode.ExtensionContext) {

	let decoder = vscode.commands.registerCommand('extension.decodeEXP', () => {
		vscode.window.showInformationMessage('Decoding EXP...');
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let doc = editor.document;
		let decodedStr: string = decodeExp(doc);
		if (decodedStr) {
			openInUntitled(decodedStr);
			vscode.window.showInformationMessage('Decoded EXP!');
		}
		else {
			vscode.window.showErrorMessage("Oops! Doesn't look you're trying to decode a valid backup file!");
		}

	});
	let encoder = vscode.commands.registerCommand('extension.encodeEXP', () => {
		vscode.window.showInformationMessage('Encoding EXP...');
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let doc = editor.document;
		let encodedStr: string = encodeEXP(doc);
		if (encodedStr) {
			openInUntitled(encodedStr);
			vscode.window.showInformationMessage('Encoded EXP!');
		}
		else {
			vscode.window.showErrorMessage("Oops! Doesn't look you're trying to decode a valid backup file!");
		}

	});
	let decodeAndCompareTwo = vscode.commands.registerCommand('extension.compareEXPWith', () => {
		let chosenFiles: any = chooseFiles();
		parseTwoFiles(chosenFiles);
	});

	context.subscriptions.push(
		decoder,
		encoder,
		decodeAndCompareTwo
	);
}

function decodeExp(doc: vscode.TextDocument): string {
	let filestr = doc.getText();
	let b= Buffer.from(filestr, 'base64');
	let decodedStr = b.toString();
	let regExp = new RegExp('&', "g");
	let regExpEq = new RegExp('=', "g");
	decodedStr = decodedStr.replace(
		regExp, "\n"
	);
	decodedStr = decodedStr.replace(
		regExpEq, " : = "
	);
	const all = new vscode.Range(
		doc.positionAt(0),
		doc.positionAt(doc.getText().length)
	);
	if (decodedStr.startsWith('checksum')) {
		return decodedStr;
	}
	else {
		return "";
	}
}
function encodeEXP(doc: vscode.TextDocument): string {
	let filestr = doc.getText();
	let b = Buffer.from(filestr);
	let encodedStr = b.toString();
	let regExp = new RegExp('\n', "g");
	encodedStr = encodedStr.replace(
		regExp, "&"
	);
	const all = new vscode.Range(
		doc.positionAt(0),
		doc.positionAt(doc.getText().length)
	);
	encodedStr = Buffer.from(encodedStr, 'binary').toString('base64') + "&";
	return encodedStr;
}
async function openInUntitled(content: string, language?: string) {
	const document = await vscode.workspace.openTextDocument({
		language,
		content,
	});
	vscode.window.showTextDocument(document);
}
function openHidden(content: string, language?: string): any {
	const document = vscode.workspace.openTextDocument({
		language,
		content,
	});
	return document;
}

async function chooseFiles() {
	const options: vscode.OpenDialogOptions = {
		canSelectMany: true,
		openLabel: 'Open',
		filters: {
			'EXP files': ['exp']
		}
	};
	const chosenFiles = await vscode.window.showOpenDialog(options).then(fileUri => {
		return fileUri;
	});
	return chosenFiles;
}

async function parseTwoFiles(chosenFiles:any) {
	let docArray: any[] = [];
	if (chosenFiles) {
		for (const file of chosenFiles) {
			const fileDoc = await vscode.workspace.openTextDocument(file);
			docArray.push(await openHidden(decodeExp(fileDoc)));
		}
		await vscode.commands.executeCommand('vscode.diff', docArray[0].uri, docArray[1].uri, "Exp Diff");
	}
}

export function deactivate() { }
