var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var router = express.Router();
var port = 3000;
var db = {
            users:[
              {username: "Ironman", password:"111", email:"test1@gmail.com"},
              {username: "Hulk", password: "1111", email:"test2@gmail.com"},
              {username: "CaptainAmerica", password: "1234", email:"test3@gmail.com"}
            ],

            questions:[
              {
                qid: 0,
                question:"Where should I eat in Vegas?", 
                descript:"Gonna be in Vegas for spring break. Give me tips on where to eat without breaking the bank!", 
                author:"CaptainAmerica", 
                time: "Mon Mar 23 2015 22:21:01 GMT-0700 (PDT)",
                tag: "food", 
                responses:[
                  {rid: 0, response: "McDonalds there is the bomb! Check it out!", votes:0, author:"Ironman", time: "Mon Mar 23 2015 22:21:01 GMT-0700 (PDT)"}
                ]
              }
            ]
          };

// Setup view engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

//Set up session
//Change session storage to real db in production
app.use(session({secret: 'Victoria'}));

//Set up to parse POST data
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

//Set up
app.use(express.static(path.join(__dirname, '/public')));
app.use(router);

//Make db available to all templates
app.locals.db = db;

/* Routes for home page. */
router.route('/')
  .get(function(req, res) {
    if(req.session.validUser){
      res.render('index', { title: 'AskUs!-Homepage', user: req.session.username});
    }else{
      res.render('login', { title: 'AskUs!-Login', promptFail: req.session.msg});
    } 
  })
  .post(function(req, res) {
    if(req.session.validUser){
      //Add question
      var newQuestion = {
        qid: db.questions.length,
        question: req.body.question,
        descript: req.body.descript,
        tag: req.body.tag,
        author: "TheHulk", //Refactor later
        time: Date(), //Verify timezone later
        responses: []
      }
      db.questions.push(newQuestion);
      res.render('index', { title: 'AskUs!-Homepage'});
    }else{
      res.render('login', { title: 'AskUs!-Login', promptFail: 'Only members can ask questions.'});
    }
  });

/* Routes to view a question. */
router.route('/question/:id')
  .get(function(req, res) {
    if(req.session.validUser){
      res.render('question', { title: 'AskUs!', myQid:req.params.id});
    }else{
      res.render('login', { title: 'AskUs!-Login'});
    }
  })
  .post(function(req, res){ //Handles adding a reponse to a question
    if(req.session.validUser){
      var newResponse = {
        rid: db.questions[req.params.id].responses.length,
        response: req.body.resp,
        author: "Ironman", //Refactor later
        time: Date(), //Verify timezone later
        votes: 0
      };
      db.questions[req.params.id].responses.push(newResponse);
      res.render('question', { title: 'AskUs!', myQid:req.params.id});
    }else{
      res.render('login', { title: 'AskUs!-Login'});
    }
  });

/* Routes for upvote of a repsonse*/
router.get('/vote/up/:qid/:rid', function(req,res){   
  var currVotes = ++db.questions[req.params.qid].responses[req.params.rid].votes;
  res.json({data:currVotes});
});

/* Routes for downvote of a repsonse*/
router.get('/vote/down/:qid/:rid', function(req,res){   
  var currVotes = --db.questions[req.params.qid].responses[req.params.rid].votes;
  res.json({data:currVotes});
});

/* Routes for Registration */
router.route('/registration')
  .get(function(req, res){
    res.render('registration', { title: 'AskUs! - Registration'});
  })
  .post(function(req, res){
    //Account validation. Check if account already exist
    var found = db.users.filter(function(acc){
      return acc.username === req.body.username;
    }); 
    ///Create new account if account does not exist yet
    if(found.length === 0){ 
      var newAccount = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.pass
      };
      db.users.push(newAccount);
      res.render('registration', { title: 'AskUs! - Registration', promptSuccess: 'Success! Enjoy your new account.', user: req.session.username});
    }else{
      res.render('registration', { title: 'AskUs! - Registration', promptFail:'Username or email already exist.'});
    }
  });


/* Routes handles logging in */
router.post('/login',function(req,res){
  //Validate credential
  var found = db.users.filter(function(acc){
    return acc.email === req.body.email && acc.password === req.body.password;
  });
  //Initialize session if is valid user
  if(found.length === 1){
    req.session.validUser = true;
    req.session.username = found[0].username;
    res.redirect('/');
  }else{
    req.session.msg = 'Invaild email password combination';
    res.redirect('/');
  }
});

//Destroy session and logout
router.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

//Create server
var server = app.listen(port, console.log('Now listening on port: %s', port));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Development error handler
// Will print stacktrace
// Citation: Express
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler
// No stacktraces leaked to user
// Citation: Express
/*app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/
module.exports = app;