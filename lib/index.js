var url = require('url');
var Wreck = require('wreck');
var _ = require('underscore');
var Promise = require("bluebird");

function FBApi(appId, appSecret, permissions, api, cb) {
  if (!appId) throw "AppId not define";
  if (!appSecret) throw "AppSecret not define";
  this.baseapi = 'https://graph.facebook.com/';

  this.api = (api) ? this.baseapi + 'v' + api : 'https://graph.facebook.com/v2.2';
  this.appId = appId;
  this.appSecret = appSecret;

  this.appAccessToken = false;
  this.permissions = permissions || [];

  this.timeout = 10000;

  this.gettingAppToken = false;

  var callback = (cb) ? cb : function(){};
  this.getAppAccessToken().then(callback, function (e) {
    throw new Error("could not get app access token");
  });
}

FBApi.prototype.connect = function (path, oauth, json, cb) {
  var json = (json) ? {json: 'force'} : null;
  return new Promise(function (resolve, reject) {
    Wreck.request('GET', url.resolve((oauth) ? this.baseapi : this.api, path), {
      timeout: this.timeout
    }, function (err, res, payload) {
      if (err) return reject({
        error: "Request error"
      });
      Wreck.read(res, json, function (err, res) {
        if (err) return reject({
          error: "Payload error"
        });
        resolve(res);
      });
    }.bind(this));
  }.bind(this));
};


FBApi.prototype.getAccessTokenLong = function (token) {
  return new Promise(function (resolve, reject) {
    var path = url.format({
      pathname: '/oauth/access_token',
      query: {
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: token
      }
    });
    this.connect(path, true, false).bind(this).then(function (res) {
      resolve({
        token: res.toString().replace('access_token=', '').replace(/\&expires=([0-9]+)$/g, "")
      });
    }).catch(function(err){
      reject(err);
    });
  }.bind(this));
};

FBApi.prototype.getAppAccessToken = function () {
  return new Promise(function (resolve, reject) {
    if(this.gettingAppToken) return reject({
      error: "Already getting token"
    });
    this.gettingAppToken = true;
    var path = url.format({
      pathname: '/oauth/access_token',
      query: {
        'client_id': this.appId,
        'client_secret': this.appSecret,
        'grant_type': 'client_credentials'
      }
    });
    this.connect(path, true, false).bind(this).then(function (res) {
      if(res.toString().indexOf('access_token=') !== -1) {
        this.appAccessToken = res.toString().replace('access_token=', '');
        this.gettingAppToken = false;
        resolve();
      }else{
        this.gettingAppToken = false;
        reject({
          error: "Failed getting token"
        })
      }
    }).catch(function(err){
      this.gettingAppToken = false;
      reject(err);
    });
  }.bind(this));
};

// apiid check und scopes ausgeben + permission check einbauen
FBApi.prototype.checkToken = function (token) {
  return new Promise(function (resolve, reject) {
    var path = url.format({
      pathname: '/debug_token',
      query: {
        input_token: token,
        access_token: this.appAccessToken
      }
    });
    this.connect(path, false, true).bind(this).then(function (res) {
      if (res.error || res.data && res.data.error) {
        if (!_.has(res.data,"is_valid")) {
          this.getAppAccessToken().catch(function (e) {
            // silence is gold
          });
        }
        return reject({
          error: "Please reauth"
        });
      }
      if (res.data.app_id !== this.appId) return reject({
        error: "App not matching"
      }); // badass mothafucker tried to cheat
      resolve(res);
    }).catch(reject);
  }.bind(this));
};

FBApi.prototype.getTestUsers = function () {
  return new Promise(function (resolve, reject) {
    var path = url.format({
      pathname: this.appId+'/accounts/test-users',
      query: {
        access_token: this.appAccessToken
      }
    });
    this.connect(path, false, true).bind(this).then(function (res) {
      if (res.error || res.data && res.data.error) return reject({
        error: "dunno"
      });
      resolve(res);
    }).catch(reject);
  }.bind(this));
};

FBApi.prototype.checkPermission = function (token) {
  return new Promise(function (resolve, reject) {
    var path = url.format({
      pathname: '/me/permissions',
      query: {
        format: 'json',
        method: 'get',
        access_token: token
      }
    });
    this.connect(path, false, true).bind(this).then(function (res) {
      if (res.data && res.data.length) {
        var validPermissions = _.filter(res.data, function (val) {
          return (_.indexOf(this.permissions, val.permission) !== -1 && val.status === 'granted')
        }.bind(this));
        if (validPermissions.length >= this.permissions.length) {
          resolve(res);
        } else {
          reject({
            error: "Permissions are missing"
          })
        }
      } else if (res.error) {
        reject({
          error: "Please reauth"
        })
      } else {
        reject({
          error: "No valid response"
        })
      }
    }).catch(reject);
  }.bind(this))
};

module.exports = FBApi;
