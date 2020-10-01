// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// if(vscode.window.activeTextEditor){
// 	var editor: vscode.TextEditor = vscode.window.activeTextEditor;
// 	var doc: vscode.TextDocument = editor.document;
// }

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "exp-decoder" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let decoder = vscode.commands.registerCommand('extension.decodeEXP', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Decoding EXP...');
		let editor = vscode.window.activeTextEditor;
		if(!editor){
			return;
		}
		let doc = editor.document;
		// let sel = editor.selections;
		// editor.edit( editBuilder => {
		// 	editBuilder.replace(new vscode.Range(d.positionAt(0),d.positionAt(filestr.length)),"sad")
		// });
		// decodeExp();
		decodeExp(editor, doc);
	});

	context.subscriptions.push(decoder);
}

// function decodeExp(){
function decodeExp(editor: vscode.TextEditor, doc: vscode.TextDocument){
	editor.edit(function(edit){
		// let txt: string = d.getText(new vscode.Range(s.start,s.end));
		let filestr = doc.getText();
		let b: Buffer = Buffer.from(filestr,'base64');
		let decodedStr = b.toString();
		let regExp = new RegExp('&',"g");
		decodedStr = decodedStr.replace(
			regExp,"\n"
			);
		// decodedStr = decodedStr.replace('&','\n')
		// edit.replace(s, decodedStr);
		const all = new vscode.Range(
			doc.positionAt(0),
			doc.positionAt(doc.getText().length)
		);
		// editor.edit( editBuilder => {
		// 	editBuilder.replace(all,decodedStr)
		// });
		// editor.edit(eb => eb.replace(all, decodedStr));
		if(decodedStr.startsWith('checksum')){
			openInUntitled(decodedStr);
			vscode.window.showInformationMessage('Decoded EXP!');
		}
		else{
			vscode.window.showErrorMessage("Oops! Doesn't look you're trying to decode a valid backup file!");
		}
	});
}
async function openInUntitled(content: string, language?: string) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });
    vscode.window.showTextDocument(document);
}

// this method is called when your extension is deactivated
export function deactivate() {}
