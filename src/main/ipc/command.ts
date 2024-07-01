import {
  clipboard,
  type IpcMain,
  type IpcMainEvent,
  type BrowserWindow,
} from 'electron';
import settings from 'electron-settings';
import {
  Hardware,
  type Keyboard,
  type Mouse,
  type Workwindow,
} from 'keysender';

// Because the Worker class in keysender from worker.d.ts file is not exported, we have to redefine it, in this case as the Game class
declare class Game {
  /** Provides methods to synthesize keystrokes */
  readonly keyboard: Keyboard;

  /** Provides methods to synthesize mouse motions, and button clicks */
  readonly mouse: Mouse;
  /** Provides methods to work with workwindow */

  readonly workwindow: Workwindow;

  /** Use entire desktop as workwindow */
  constructor();

  /** Use the first window with {@link handle} */
  constructor(handle: number);

  /** Use the first window with {@link title} and/or {@link className} and sets it as current workwindow */
  constructor(title: string | null, className?: string | null);

  /** Use the first child window with {@link childClassName} and/or {@link childTitle} of window with {@link parentHandle} and sets it as current workwindow */
  constructor(
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null,
  );

  /** Use the first child window with {@link childClassName} and/or {@link childTitle} of the first found window with {@link parentTitle} and/or {@link parentClassName} and sets it as current workwindow */
  constructor(
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null,
  );
}

const fetch_game_process = (): Game | null => {
  // const game = new Hardware('Chivalry 2  ', 'UnrealWindow') as Game;
  const game = new Hardware(null, 'Notepad') as Game;
  if (!game.workwindow.isOpen()) return null;
  return game;
};

const write_to_console = async (game: Game | null, message: string) => {
  if (!game) return;

  clipboard.writeText(message);
  game.workwindow.setForeground();

  const consoleKey = settings.getSync('console.vKey') as number;

  await game.keyboard.sendKeys([consoleKey, ['ctrl', 'v'], 'enter']);
};

const command_queue: { event: IpcMainEvent; args: any }[] = [];
let is_processing = false;

const process_command_queue = async (main_window: BrowserWindow) => {
  if (is_processing || command_queue.length === 0) return;

  is_processing = true;
  const { event, args } = command_queue.shift()!;

  if (args.command.length === 0) {
    event.reply('command-response', {
      commandName: args.command,
      error: 'Command is empty',
    });

    is_processing = false;
    process_command_queue(main_window);
    return;
  }

  const game = fetch_game_process();
  if (!game) {
    event.reply('command-response', {
      commandName: args.command,
      error: 'Game not found',
    });

    is_processing = false;
    process_command_queue(main_window);
    return;
  }

  await write_to_console(game, args.command);
  main_window.show();

  event.reply('command-response', {
    command: args.commandName,
    toast: args.toast,
  });

  is_processing = false;
  process_command_queue(main_window);
};

export default (ipc_main: IpcMain, main_window: BrowserWindow) => {
  ipc_main.on('command', (event, args) => {
    command_queue.push({ event, args });
    process_command_queue(main_window);
  });
};
