import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { IPCWindowKey } from '../common/ipc-keys'
import { createNewWindow, getWindowIds, sendMessege } from './window-manager'

/**
 * Occurs when create window is requested.
 * @param ev Event data.
 */
const onCreateNewWindow = (ev: IpcMainInvokeEvent) => {
  createNewWindow()
}

/**
 * Occurs when send message to other windows is requested.
 * @param ev Event data.
 * @param targetWindowId The identifier of target window.
 * @param message Message to be sent
 */
const onSendMessage = async (
  ev: IpcMainInvokeEvent,
  targetWindowId: number,
  message: string
) => {
  ev.sender.send(IPCWindowKey.SendMessage, sendMessege(targetWindowId, message))
  return {
    targetWindowId,
    message
  }
}

/**
 * Occurs when get window identifiers is requested.
 * @param ev Event data.
 */
const onGetWindowIds = (ev: IpcMainInvokeEvent) => {
  ev.sender.send(IPCWindowKey.UpdateWindowIds, getWindowIds())
}

/**
 * A value indicating that an IPC events has been initialized.
 */
let initialized = false

/**
 * Initialize IPC events.
 */
export const initializeIpcEvents = () => {
  if (initialized) {
    return
  }
  initialized = true

  ipcMain.handle(IPCWindowKey.CreateNewWindow, onCreateNewWindow)
  ipcMain.handle(IPCWindowKey.SendMessage, onSendMessage)
  ipcMain.handle(IPCWindowKey.GetWindowIds, onGetWindowIds)
}

/**
 * Release IPC events.
 */
export const releaseIpcEvents = () => {
  if (initialized) {
    ipcMain.removeAllListeners(IPCWindowKey.CreateNewWindow)
    ipcMain.removeAllListeners(IPCWindowKey.SendMessage)
    ipcMain.removeAllListeners(IPCWindowKey.GetWindowIds)
  }

  initialized = false
}
