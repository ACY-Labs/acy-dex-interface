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
    if(this.mode == 'token')
      console.log('getTokenAddress:',localStorage.getItem(this.mode));
    return JSON.parse(localStorage.getItem(this.mode));
  }
  getTokensSymbol() {
    let tokens = JSON.parse(localStorage.getItem('tokens_symbol'));
    if(tokens!= null) return tokens;
    return [];
    // console.log('getTokenSymbol:',localStorage.getItem('tokens_symbol'));
    // return JSON.parse(localStorage.getItem('tokens_symbol'));
  }
  saveData(data) {
    localStorage.setItem(this.mode, JSON.stringify(data));
  }
  saveTokensSymbol(data) {
    localStorage.setItem('tokens_symbol', JSON.stringify(data));
  }
}
