var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var app = express();
var router = express.Router();
var port = 8000;
var db = {
            users:[
              {username: "Ironman", password:"1234", email:"test1@gmail.com"},
              {username: "Hulk", password: "1234", email:"test2@gmail.com"},
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
var session;


// Setup view engine
// Source: Express
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

//Set up
app.use(expressSession({secret: 'mysecret'}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(router);

//Make db available to all templates
app.locals.db = db;

/* Routes for home page. */
router.route('/')
  .get(function(req, res) {
    res.render('index', { title: 'AskUs!-Homepage'});
  })
  .post(function(req, res) {
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
    //console.log(req.body);
    res.render('index', { title: 'AskUs!-Homepage'});
  });

/* Routes for a question. */
router.route('/question/:id')
  .get(function(req, res) {
    res.render('question', { title: 'AskUs!', myQid:req.params.id});
  })
  .post(function(req, res){
    var newResponse = {
      rid: db.questions[req.params.id].responses.length,
      response: req.body.resp,
      author: "Ironman", //Refactor later
      time: Date(), //Verify timezone later
      votes: 0
    };
    console.log(newResponse);
    db.questions[req.params.id].responses.push(newResponse);
    res.render('question', { title: 'AskUs!', myQid:req.params.id});
  });

/* Routes for upvote of a repsonse*/
router.get('/vote/up/:qid/:rid', function(req,res){   
  console.log("got the up");
  var currVotes = ++db.questions[req.params.qid].responses[req.params.rid].votes;
  res.json({data:currVotes});
});

/* Routes for downvote of a repsonse*/
router.get('/vote/down/:qid/:rid', function(req,res){   
  console.log("got the down");
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
    if(found.length === 0){ //If no account found
      var newAccount = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.pass
      };
      db.users.push(newAccount);
      console.log(db.users);
      res.render('registration', { title: 'AskUs! - Registration', prompt: 'Success! Enjoy your new account.'});
    }else{
      console.log(db.users);
      res.render('registration', { title: 'AskUs! - Registration', prompt:'Username already exist.'});
    }
  });

/* Routes handles signin */
router.post('/signin',function(req,res){
  //Validate credential
  var found = db.users.filter(function(acc){
    return acc.email === req.body.email && acc.password === req.body.password ;
  });

  if(found.length === 1){
    //create session 
    session=req.session;
    session.email=req.body.email;
    console.log(session);
    res.render('index', { title: 'AskUs!-Homepage'});
  }else{
    res.render('index', { title: 'AskUs!-Homepage', promptFail: "Invaild email password combination "});
  }
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