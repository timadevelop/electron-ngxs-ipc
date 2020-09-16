import { BrowserWindow, screen as electronScreen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { IPCWindowKey } from '../../common/ipc-keys';


const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

/**
 * Current window list.
 */
const currentWindows: Map<number, BrowserWindow> = new Map()

/**
 * Notify that the window ID list has been updated.
 * @param excludeId Window identifier to exclude from notification target.
 */
const notifyUpdateWindowIDs = (excludeId: number) => {
  const windowIds = Array.from(currentWindows.keys())
  currentWindows.forEach((w) => {
    if (w.id === excludeId) {
      return
    }

    w.webContents.send(IPCWindowKey.UpdateWindowIds, windowIds)
  })
}

/**
 * Create a window and add it to the list.
 */
export const createNewWindow = () => {
  const size = electronScreen.getPrimaryDisplay().workAreaSize;


  // return win;
  const newWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      devTools: (serve) ? true : false
    },
    // TODO
    // icon: path.join(__dirname, '../icons/favicon64x64.png')
  });


  const windowId = newWindow.id
  newWindow.on('closed', () => {
    /// #if env == 'DEBUG'
    console.log(`Window was closed, id = ${windowId}`)
    /// #endif
    // Dereference the window object

    currentWindows.delete(windowId)
    notifyUpdateWindowIDs(windowId)
  })

  // The window identifier can be checked from the Renderer side.
  // `win.loadFile` will escape `#` to `%23`, So use `win.loadURL`
  // const filePath = path.join(__dirname, 'index.html')
  // newWindow.loadURL(`file://${filePath}#${windowId}`)


  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../../../../node_modules/electron`)
    });
    newWindow.loadURL('http://localhost:4200');
  } else {
    newWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../../../../dist/angular/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    newWindow.webContents.openDevTools();
  }


  currentWindows.set(windowId, newWindow)
  notifyUpdateWindowIDs(windowId)
}

/**
 * Send message to other windows.
 * @param targetWindowId The identifier of target window.
 * @param message Message to be sent
 * @returns `true` on success. `false` if the target window can't be found.
 */
export const sendMessege = (
  targetWindowId: number,
  message: string
): boolean => {
  const w = currentWindows.get(targetWindowId)
  console.log('sending msg for window', targetWindowId)
  if (w) {
    console.log('yep')
    w.webContents.send(IPCWindowKey.UpdateMessage, message)
    return true
  }
  console.log('no')

  return false
}

/**
 * Get a current window identifiers.
 */
export const getWindowIds = (): number[] => {
  return Array.from(currentWindows.keys())
}
