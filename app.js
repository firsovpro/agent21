var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , mysql = require('mysql')  
  , YandexStrategy = require('passport-yandex').Strategy;
var vow = require('vow');
var YANDEX_CLIENT_ID = "673eb54884e44b73a3467230f45f5e88"
var YANDEX_CLIENT_SECRET = "813b905e05b644d78bada3cf37293698";

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '5895472lis',
  database : 'c9'
});
db.connect();
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Yandex profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the YandexStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Yandex
//   profile), and invoke a callback with a user object.
passport.use(new YandexStrategy({
    clientID: YANDEX_CLIENT_ID,
    clientSecret: YANDEX_CLIENT_SECRET,
    callbackURL: "http://agent21.ru:300/auth/yandex/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Yandex profile is returned
      // to represent the logged-in user.  In a typical application, you would
      // want to associate the Yandex account with a user record in your
      // database, and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

/*

db.query('SELECT `title` FROM `posts` WHERE `id` = 10', function(err, rows, fields) {
	console.log(rows[0]);
});

*/
    var db = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '5895472lis',
      database : 'c9'
    });
    db.connect();  

app.get('/api/person/:id', function(req, res) {
    db.query("SELECT * FROM `person` WHERE `UID` = '"+req.params.id+"'", function(err, rows, fields) {
      if(err) return console.log(err);
      res.json(rows);
    });
});


function getSobst(tempPr){
  var s ="";
  for(var i=0;i<tempPr.length;i++){
    if(s==""){
      s+="'"+tempPr[i]+"'";
    }else{
      s+=",'"+tempPr[i]+"'";
    }
    var sql = "SELECT * FROM `person` WHERE `TIP` = 'FIELD' AND `PUID` in ("+s+")"; 
      db.query(sql, function(err, rows, fields) {
        if(err) return console.log(err);
        return rows;
      });
  }
}

app.get('/api/objects/:id', function(req, res) {
    var tempPr = [];
    db.query("SELECT * FROM `im2015` WHERE `ID` = '"+req.params.id+"'", function(err, rows, fields) {
      if(err) return console.log(err);
      tempPr.push(rows[0].SOBSTUID);
      var rowAddr = rows;
      db.query("SELECT * FROM `im2015` WHERE `PUID` = '"+rowAddr[0].UID+"'", function(err, rows, fields) {
        if(err) return console.log(err);
        rowAddr[0]['ALLPL'] = rows;
        for (var i=0;i<rows.length;i++){
          tempPr.push(rows[i].SOBSTUID);
        }
        // дёргаем собственников     
        var s ="";
        for(var i=0;i<tempPr.length;i++){
          if(tempPr[i]!=''){
            if(s==""){
              s+="'"+tempPr[i]+"'";
            }else{
              s+=",'"+tempPr[i]+"'";
            }
          }
        }
        var sobst = {};
        var sql = "SELECT * FROM `person` WHERE `TIP` = 'FIELD' AND `PUID` in ("+s+")"; 
        db.query(sql, function(err, rows, fields) {
          if(err) return console.log(err);
          for(var i=0;i<rows.length;i++){
            if(sobst[rows[i].PUID]==null)sobst[rows[i].PUID]={};
            sobst[rows[i].PUID][rows[i].TITLE] = rows[i].VALUE;
          }
          // дёргаем персон
          var sql = "SELECT * FROM `person` WHERE `TIP` = 'LASHING' AND `UID` in ("+s+")"; 
          db.query(sql, function(err, rows, fields) {
            if(err) return console.log(err);
            rowAddr[0]['LASHING'] = {};
            tempPr=[];
            for(var i=0;i<rows.length;i++){
              if(rowAddr[0]['LASHING'][rows[i].PUID]==null){
                rowAddr[0]['LASHING'][rows[i].PUID]={};
                tempPr.push(rows[i].PUID);
                rowAddr[0]['LASHING'][rows[i].PUID]['PUID'] = rows[i].UID;
                rowAddr[0]['LASHING'][rows[i].PUID]['FIELDS'] = {};
              }
            }
            
            var s ="";
            for(var prop in rowAddr[0]['LASHING']){
              if(s==""){
                s+="'"+prop+"'";
              }else{
                s+=",'"+prop+"'";
              }
            }
            var sql = "SELECT * FROM `person` WHERE `TIP` = 'FIELD' AND `PUID` in ("+s+")"; 
            db.query(sql, function(err, rows, fields) {
              if(err) return console.log(err);
              for(var i=0;i<rows.length;i++){
                rowAddr[0]['LASHING'][rows[i].PUID]['FIELDS'][rows[i].TITLE]=rows[i].VALUE;
              }



              rowAddr[0]['SOBST'] = sobst;
              rowAddr[0]['UIDS'] = tempPr;
              rowAddr[0]['LASHING11'] = rows;
              res.json(rowAddr);
            });
          });
        });
      });
      
//      res.json(rows);
    });
});

app.get('/api/objects', function(req, res){
    db.query("SELECT * FROM `im2015` WHERE `TIP` = 'Адрес'", function(err, rows, fields) {
      if(err) return console.log(err);
      var outOb = {
          rows:[]
      };
      for(var i=0;i<rows.length;i++){
        outOb.rows.push({
            id:rows[i].ID,
            data:[
                    false,
                    rows[i].TITLE,
                    rows[i].UID,
                    rows[i].OPP,
                    rows[i].TIP,
                    rows[i].UID
                ]
            }
        );
      }
      res.json(outOb);
    });
});

app.get('/api/usersList', function(req, res){
    res.json({ user: req.user});
});

app.get('/api/users', function(req, res){
    res.json({ user: req.user});
});


app.get('/', function(req, res){
  res.render('layout', { user: req.user,body:'' });
});


app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user,body:'<a href=\'/auth/yandex\'>Login with Yandex</a>' });
});

// GET /auth/yandex
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Yandex authentication will involve
//   redirecting the user to yandex,ru.  After authorization, Yandex
//   will redirect the user back to this application at /auth/yandex/callback
app.get('/auth/yandex',
  passport.authenticate('yandex'),
  function(req, res){
    // The request will be redirected to Yandex for authentication, so this
    // function will not be called.
  });

// GET /auth/yandex/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(300);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
