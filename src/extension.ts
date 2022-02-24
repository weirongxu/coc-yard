import { commands, ExtensionContext } from 'coc.nvim';
import { logger } from './util';
import YardDocumenter from './yard_documenter';

// This method is called when extension is activated
export function activate(context: ExtensionContext) {
  const command = commands.registerCommand(
    'extension.generateYard',
    logger.asyncCatch(async () => {
      return YardDocumenter.generate();
    }),
  );

  context.subscriptions.push(command);
}
