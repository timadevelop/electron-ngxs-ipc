/**
 * App State Actions
 */
export namespace AppActions {
  export class Init {
    static readonly type = '[App] Init';
    constructor() { }
  }

  export class ChangeTitle {
    static readonly type = '[App] ChangeTitle';
    constructor(public newTitle: string) { }
  }

  export class RandomizeRNumber {
    static readonly type = '[App] RandomizeRNumber';
    constructor() { }
  }

  export class GetWindowIds {
    static readonly type = '[App] GetWindowIds';
    constructor() { }
  }

  export class SendIpcMessage {
    static readonly type = '[App] SendIpcMessage';
    constructor(
      public message: string,
      public targetWindowId: number
    ) { }
  }

  export class FetchWindowIds {
    static readonly type = '[App] FetchWindowIds';
    constructor() { }
  }

  export class UpdateWindowIds {
    static readonly type = '[App] GetWindowIds';
    constructor(public windowIds: Array<number>) { }
  }

  export class CreateNewWindow {
    static readonly type = '[App] CreateNewWindow';
    constructor() { }
  }

  export class UpdateMessage {
    static readonly type = '[App] Message';
    constructor(public message: string) { }
  }

  export class HandleIpcMessages {
    static readonly type = '[App] HandleIpcMessages';
    constructor() { }
  }
}
