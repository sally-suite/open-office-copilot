export class Mutex {
    _locked: boolean;
    _waitTime: number;
    constructor(waitTime = 300) {
        this._locked = false;
        this._waitTime = waitTime;
    }

    lock() {
        return new Promise<void>((resolve) => {
            const checkLock = () => {
                if (!this._locked) {
                    this._locked = true;
                    resolve();
                } else {
                    setTimeout(checkLock, this._waitTime);
                }
            };
            checkLock();
        });
    }

    unlock() {
        this._locked = false;
    }
}