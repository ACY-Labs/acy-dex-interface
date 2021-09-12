// class to handle watchlist and local storage interactions
// this class returns only raw data, any rendering should be done in front end
// set key in constructor
// save only COIN shorthands for tokens
// save only the pair name for the POOL
// includes callback when storage changes
// mode is either "pool" or "token"
export class WatchlistManager {
  constructor(mode) {
    this.mode = mode;
    if (!localStorage.getItem(this.mode)) localStorage.setItem(this.mode, JSON.stringify([]));
  }
  getMode() {
    return this.mode;
  }
  getData() {
    return JSON.parse(localStorage.getItem(this.mode));
  }
  saveData(data) {
    localStorage.setItem(this.mode, JSON.stringify(data));
  }
}
