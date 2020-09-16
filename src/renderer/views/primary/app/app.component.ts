import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Observable } from 'rxjs';
import { AppState } from './state/app.state';
import { Store, Select } from '@ngxs/store';
import { AppActions } from './state/app.actions';

/**
 * Entry App component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   * A counter for creating new windows with new id
   */
  private _nextWindowId = 0;
  /**
   * Ngxs Selectors
   */
  @Select(AppState.selectTitle) title$: Observable<string>;
  @Select(AppState.selectRNumber) rnumber$: Observable<number>;
  @Select(AppState.selectWindowId) windowId$: Observable<number>;
  @Select(AppState.selectWindowIds) windowIds$: Observable<Array<number>>;
  @Select(AppState.selectMessage) message$: Observable<string>;

  /**
   * Initializes application
   * @param electronService electron service
   * @param translate translate service
   * @param store ngxs store
   */
  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private readonly store: Store
  ) {
    // set default language
    translate.setDefaultLang('en');

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  public changeLang(lang: 'en' | 'ru') {
    this.translate.use(lang);
  }

  /**
   * Dispatches new change title action
   * New title is generated based on window counter
   */
  public changeTitle() {
    this.store.dispatch([
      new AppActions.ChangeTitle(`Title #${this._nextWindowId++}`),
    ]);
  }

  /**
   * Randomizes rnumber in ngxs store
   */
  public rand() {
    this.store.dispatch([
      new AppActions.RandomizeRNumber(),
    ]);
  }

  /**
   * Creates a new window
   */
  public createNewWindow() {
    this.store.dispatch([
      new AppActions.CreateNewWindow()
    ])
  }

  /**
   * Sends message to window with windowId
   * @param message message text
   * @param windowId target window id
   */
  public async sendMessage(message: string, windowId: string) {
    this.store.dispatch([
      new AppActions.SendIpcMessage(message, parseInt(windowId))
    ]);
  }
}
