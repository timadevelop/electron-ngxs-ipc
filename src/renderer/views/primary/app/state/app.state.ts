import { State, Action, StateContext, Selector, Store, NgxsOnInit } from '@ngxs/store';
import { AppActions } from './app.actions';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { ElectronService } from '../core/services';
import { IPCWindowKey } from '../../../../../common/ipc-keys';
import { IpcRendererEvent } from 'electron';
import { Injectable } from '@angular/core';

/**
 * App State Model
 */
export interface AppStateModel {
  /**
   * Title
   */
  title: string;
  /**
   * Random number
   */
  rnumber: number;
  /**
   * Current window id
   */
  windowId: number,
  /**
   * Window ids list
   */
  windowIds: Array<number>,
  /**
   * Last arrived message from IPC channel
   */
  message: string
}

/**
 * Ngxs App State
 */
@Injectable()
@State<AppStateModel>({
  name: 'app',
  defaults: {
    title: 'Default AppState Title',
    rnumber: -1,
    windowId: -1,
    windowIds: [],
    message: ''
  }
})
export class AppState implements NgxsOnInit {
  /**
   * Flag to track if IPCRenderer events are handled by event listeners.
   */
  private _handledIpcEvents = false;

  /**
   * App State Constructor
   * @param electronService injecting ElectronService is needed for IPC events
   */
  constructor(
    private readonly electronService: ElectronService
  ) { }

  /**
   * Life-cycle NgxsOnInit event handler
   * Dispatches Init Action
   * @param ctx state context
   */
  ngxsOnInit(ctx: StateContext<AppStateModel>) {
    ctx.dispatch(new AppActions.Init());
  }

  /**
   * Ngxs Selector for title
   * @param state Current State
   */
  @Selector()
  static selectTitle(state: AppStateModel) {
    return state.title
  }

  /**
   * Ngxs Selector for rnumber
   * @param state Current State
   */
  @Selector()
  static selectRNumber(state: AppStateModel) {
    return state.rnumber
  }


  /**
   * Ngxs Selector for windowIds
   * @param state Current State
   */
  @Selector()
  static selectWindowIds(state: AppStateModel) {
    return state.windowIds
  }


  /**
   * Ngxs Selector for windowId
   * @param state Current State
   */
  @Selector()
  static selectWindowId(state: AppStateModel) {
    return state.windowId
  }


  /**
   * Ngxs Selector for message
   * @param state Current State
   */
  @Selector()
  static selectMessage(state: AppStateModel) {
    return state.message
  }


  /**
   * Init action: initializes the state with dynamic data.
   * @param ctx state context
   * @param action action
   */
  @Action(AppActions.Init)
  init(ctx: StateContext<AppStateModel>, action: AppActions.Init) {
    // set current window id
    ctx.patchState({
      windowId: this.electronService.currentWindowId
    });
    // initialize IPC messages,
    // load window ids
    ctx.dispatch([
      new AppActions.HandleIpcMessages(),
      new AppActions.FetchWindowIds()
    ]);
  }

  /**
   * Changes title in current state
   * @param ctx App state context
   * @param action action with title payload
   */
  @Action(AppActions.ChangeTitle)
  changeTitle(ctx: StateContext<AppStateModel>, action: AppActions.ChangeTitle) {
    ctx.patchState({ title: action.newTitle });
  }

  /**
   * Randomized Rnumber with 5s delay.
   * Firing a new action causes previous uncomplited actions to be canceled.
   * @param ctx The state context
   * @param action The RandomizeRNumber action
   */
  @Action(AppActions.RandomizeRNumber, { cancelUncompleted: true })
  async randomize(ctx: StateContext<AppStateModel>, action: AppActions.RandomizeRNumber) {
    let result;
    try {
      result = await of(Math.random()).pipe(delay(5000)).toPromise();
    } catch (err) {
      result = -1;
    }

    ctx.patchState({ rnumber: result });
  }

  /**
   * Updates current state changing "windowIds" in AppState
   * @param ctx app state context
   * @param action action with a new "windowIds" value in payload
   */
  @Action(AppActions.UpdateWindowIds)
  updateWindowIds(ctx: StateContext<AppStateModel>, action: AppActions.UpdateWindowIds) {
    ctx.patchState({ windowIds: action.windowIds });
  }

  /**
   * Updates current state changing "message" in AppState
   * @param ctx app state context
   * @param action action with new message in payload
   */
  @Action(AppActions.UpdateMessage)
  updateMessage(ctx: StateContext<AppStateModel>, action: AppActions.UpdateMessage) {
    ctx.patchState({ message: action.message });
  }

  /**
   * Asks Electron to send window ids back
   * @param ctx app state context
   * @param action empty with no payload
   */
  @Action(AppActions.FetchWindowIds)
  fetchWindowIds(ctx: StateContext<AppStateModel>, action: AppActions.FetchWindowIds) {
    this.electronService.ipcRenderer.invoke(IPCWindowKey.GetWindowIds);
  }

  /**
   * Sends a given message to window with a given id through IPC channel
   * @param ctx app state context
   * @param action action with targetWindowId & message in payload
   */
  @Action(AppActions.SendIpcMessage)
  async sendIpcMessage(ctx: StateContext<AppStateModel>, action: AppActions.SendIpcMessage) {
    const result = await this.electronService.ipcRenderer.invoke(
      IPCWindowKey.SendMessage,
      action.targetWindowId,
      action.message
    );
    console.log('got result from invoke msg: ', result);
  }


  /**
   * Sends IPC signal to create a new window
   * @param ctx app state context
   * @param action empty action
   */
  @Action(AppActions.CreateNewWindow)
  createNewWindow(ctx: StateContext<AppStateModel>, action: AppActions.CreateNewWindow) {
    this.electronService.ipcRenderer.invoke(IPCWindowKey.CreateNewWindow);
  }

  /**
   * Initializes event listeners on IpcRenderer UpdateMessage and UpdateWindowIds events
   * @param ctx app state context
   * @param action empty action
   */
  @Action(AppActions.HandleIpcMessages)
  handleIpcMessages(ctx: StateContext<AppStateModel>, action: AppActions.HandleIpcMessages) {
    try {
      /**
       * Do nothing if event listeners are initialized already.
       */
      if (this._handledIpcEvents) {
        return;
      }

      // mark ipc events handled
      this._handledIpcEvents = true;

      // listen for new messages
      this.electronService.ipcRenderer.on(
        IPCWindowKey.UpdateMessage,
        (ev: IpcRendererEvent, message: string) => {
          console.log("dispatching new message: ", message);
          ctx.dispatch(new AppActions.UpdateMessage(message));
        }
      )

      // listen for new window ids
      this.electronService.ipcRenderer.on(
        IPCWindowKey.UpdateWindowIds,
        (ev: IpcRendererEvent, windowIds: Array<number>) => {
          console.log("dispatching new window ids: ", windowIds);
          ctx.dispatch(new AppActions.UpdateWindowIds(windowIds));
        }
      )
    } catch (e) {
      // TODO: handle errors
      console.log('Error:', e);
    }
  }

}
