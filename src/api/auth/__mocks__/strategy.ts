import passport from 'passport';
import * as util from 'util';

const passportCallback = (
  accToken: string,
  refreshToken: any,
  profile: any,
  callback?: (...args: any[]) => any
) => {
  if (callback) {
    return callback(null, profile);
  }
};

// tslint:disable-next-line:function-name
function StrategyMock(name: string, strategyCallback = passportCallback, user?: any) {
  if (!name || name.length === 0) {
    throw new TypeError('DevStrategy requires a Strategy name');
  }
  // @ts-ignore
  passport.Strategy.call(this);
  // @ts-ignore
  this.name = name;
  // @ts-ignore
  this._user = user;
  // Callback supplied to OAuth2 strategies handling verification
  // @ts-ignore
  this._cb = strategyCallback;
}

StrategyMock.prototype.authenticate = function () {
  this._cb(null, null, this._user, (error: any, user: any) => {
    this.success(user);
  });
};

util.inherits(StrategyMock, passport.Strategy);

export default StrategyMock;
