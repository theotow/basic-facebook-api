describe('Check Lib', function () {

  var FBApi = require("../lib/index");
  var api = 'https://graph.facebook.com/v2.2/';
  var appid = '1069984529695354';
  var appsecret = '5f4a3b0702d621d0e76f396c54a80759';
  var instance;
  var testuser = '1377117155942150';
  var testuser_access;
  var token_invalid = 'CAAPNJSZCOwnoBALFiNKEAmf8DBO1VDBtDAwc6SZCIvwqZArNG3X0orLtveePOBtAtPCLRqUPIpm7Q2hSHxdkIPErBnlYBswyzgfbyozHAHQbkrHUraSFAzTZAI6FrPSHZAcl5DKKzvMhLCCjuEDqMHdhGs2xWuxbCqH8sFZBrcVqDf4Ajz6VTOVyzzErxCkTFEvuYqgbp2rKjHyhTZCK9Cy';


  before(function (done) {
    this.timeout(30000);
    instance = new FBApi(appid, appsecret, ['public_profile'], undefined, function () {
      instance.getAppAccessToken().then(function () {
        instance.getTestUsers().then(function (res) {
          var user = _.findWhere(res.data, {id: testuser});
          if (user && user.access_token) {
            testuser_access = user.access_token;
            done();
          }
        }).catch(done);
      }).catch(done);
    });
  });

  it('should use the version', function (done) {
    var instance = new FBApi(appid, appsecret, ['public_profile'], "2.1");
    expect(instance.api).to.equal("https://graph.facebook.com/v2.1");
    done();
  });
  it('should use default version', function (done) {
    expect(instance.api).to.equal("https://graph.facebook.com/v2.2");
    done();
  });

  it('should get app access token', function (done) {
    this.timeout(10000);
    instance.getAppAccessToken().then(function () {
      expect(instance.appAccessToken).to.match(/^([0-9]+)\|([0-9a-zA-Z\_\-]+)$/);
      done();
    }).catch(done);
  });

  it('should be an invalid token', function (done) {
    this.timeout(10000);
    instance.checkToken(token_invalid).catch(function (e) {
      expect(e).to.deep.equal({error: 'Please reauth'});
      done();
    });
  });

  it('should be an invalid token (checkPermission)', function (done) {
    this.timeout(10000);
    instance.checkPermission(token_invalid).catch(function (e) {
      expect(e).to.deep.equal({error: 'Please reauth'});
      done();
    });
  });

  it('should be an valid token', function (done) {
    this.timeout(20000);

    instance.checkToken(testuser_access).then(function (res) {
      expect(res.data.is_valid).to.be.true;
      done();
    }).catch(done);
  });

  it('should be an valid permission', function (done) {
    this.timeout(20000);

    instance.checkPermission(testuser_access).then(function (res) {
      done();
    }).catch(done);
  });

  it('should be an valid login token long', function (done) {
    this.timeout(20000);

    instance.getAccessTokenLong(testuser_access).then(function (res) {
      expect(res.token).to.match(/^((?:[a-z][a-z]*[0-9]+[a-z0-9]*))$/i);
      instance.checkToken(res.token).then(function (res) {
        expect(res.data.is_valid).to.be.true;
        done();
      }).catch(done);
    }).catch(done);
  });

  it('should not run getAppAccessToken 2 in parallel', function (done) {
    this.timeout(20000);

    var instance2 = new FBApi(appid, appsecret, ['public_profile']);
    instance2.getAppAccessToken().catch(function(e){
      expect(e).to.deep.equal({error: 'Already getting token'});
      done();
    });
  });

});
