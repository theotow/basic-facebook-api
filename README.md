
### **basic-facebook-api**

[![Build Status](https://travis-ci.org/theotow/basic-facebook-api.svg?branch=master)]

This lib is for humans who want to check if the access_token someone send from the frontend is valid and can be used for further processing. Also it allowes to get an long term access_token of facebook.


### Usage


Make a instance
```javascript
var FBApi = require('basic-facebook-api');

var instance = new FBApi(appid, appsecret, scopes(array), version(string), cb);
```

Check token
```javascript
instance.checkToken(token(string)).then(function(res){
  // do something
}).catch(function (e) {
  e.error // reauth or other error    
});
```

Check permission
```javascript
instance.checkPermission(token(string)).then(function(res){
  // has enough or more permissions then needed
}).catch(function (e) {
  e.error // does not have the needed permissions
});
```

Get app access token
```javascript
instance.getAppAccessToken().then(function(){
    instance.appAccessToken // here is the token
}).catch(function(e){
    e.error // some error
});
```

Get long term access_token
```javascript
instance.getAccessTokenLong(token(string)).then(function(res){
    res.token // here is the long term token
}).catch(function(e){
   e.error // some error
});
```





## License

(The MIT License)

Copyright (c) 2011-2015 Manuel Villing <hi@manuelvilling.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
