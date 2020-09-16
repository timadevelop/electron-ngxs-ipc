import { app } from 'electron'
import { initializeIpcEvents, releaseIpcEvents } from './ipc-events'
import { createMainMenu } from './menu'
import { createNewWindow, getWindowIds } from './window-manager'

/**
 * Initializes application, services, etc
 */
const initializeApp = () => {
  /// #if env == 'DEBUG'
  console.log('Initialize Application')
  /// #endif
  createNewWindow()
  createMainMenu()
  initializeIpcEvents()
}

try {
  app.name = 'MultipleWindows'

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', initializeApp)

  /// #if env == 'DEBUG'
  app.on('quit', () => {
    console.log('Application is quit')
  })
  /// #endif

  app.on('window-all-closed', () => {
    /// #if env == 'DEBUG'
    console.log('All of the window was closed.')
    /// #endif

    releaseIpcEvents();
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (getWindowIds().length < 1) {
      initializeApp();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
