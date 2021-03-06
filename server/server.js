var express = require('express');
var db = require('./db').mongoose;
var bodyParser = require('body-parser');
var path = require('path');
var Exercise = require('./db').exerciseModel;
var User = require('./db').userModel;
var ObjectID = require('mongodb').ObjectID;
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var multer = require('multer');

// Initiate Express Server
var app = express();
app.listen(process.env.PORT || 3000);
console.log('server is running');

// Initiate PW Encryption
var bcrypt = require('bcrypt');
var saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

// Initiate Multer
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../userfiles'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
var upload = multer({'storage': storage}).fields([{name:'videoFile', maxcount: 1}, {name: 'pictureFile', maxcount: 1}]);

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Middleware Load
* * * * * * * * * * * * * * * * * * * * * * * * * * */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload);
app.use(express.static(path.join(__dirname, '../userfiles')));
app.use('/public', express.static('client/public'));
app.use('/react', express.static('node_modules/react/dist'));
app.use('/react-dom', express.static('node_modules/react-dom/dist'));
app.use('/react-router', express.static('node_modules/react-router'));
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  User Persistent Session Settings
* * * * * * * * * * * * * * * * * * * * * * * * * * */

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  store: new FileStore(),
  saveUninitialized: true,
  cookie: { secret: 'hello', maxAge: 1000 * 60 * 60 * 24 * 365, secure: false}
}))

app.use(function(req, res, next) {
  var sess = req.session
  if (sess.views) {
    sess.views++
  } else {
    sess.views = 1
  }
  console.log('this is the session id', req.session.id)
  next();
})


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  API Routes
* * * * * * * * * * * * * * * * * * * * * * * * * * */

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.get('/islogged', checkSession);
app.get('/workout', getWorkout);
app.get('/history', getHistory);
app.get('/destroyCookie', destroyCookie);
app.get('/warmups', getWarmups);
app.get('/allExercises', getAllExercises);
app.get('/getExerciseByType', getExerciseByType);
app.get('/workoutList', getWorkoutList);

app.post('/addWorkout', addWorkout);
app.post('/login', checkLogin);
app.post('/signup', addSignup);
app.post('/createworkout', saveWorkout);
app.post('/addExerciseToUser', addExerciseToUser);
app.post('/removeExerciseFromUser', removeExerciseFromUser);


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Request Handlers
* * * * * * * * * * * * * * * * * * * * * * * * * * */



function getWorkoutList(req, res) {
  User.findOne({username: req.query.username}, function(err, data) {
    if (err) {
      console.log('err getting owner workout List from db')
    } else {
      res.status(200).send(data.workoutList);
    }
  })
}

function getAllExercises(req, res) {
  var results = [];
  Exercise.find({type: 'warmup'}, function(err, data) {
    if (err) {
      console.log('err getting warmups')
    } else {
      results.push(data);
      Exercise.find({type: 'workout'}, function(err, data) {
        if (err) {
          console.log('err getting workouts');
        } else {
          results.push(data);
          Exercise.find({type: 'cooldown'}, function(err, data) {
            if (err) {
              console.log('err getting cooldowns')
            } else {
              results.push(data);
              res.status(200).send(results);
            }
          })
        }
      })
    }
  })
}

function getExerciseByType(req, res) {
  var typeObj = req.query;
  Exercise.find(typeObj, function(err, data) {
    if (err) {
      console.log('err getting cooldowns in db');
    } else {
      console.log('success in db!', data);
      res.status(200).send(data);
    }
  })
}

function getWarmups(req, res) {
  Exercise.find({type: 'warmup'}, function(err, data) {
    if (err) {
      console.log('err getting warmups from db');
    } else {
      console.log('success! warmups from db: ', data);
      res.status(200).send(data);
    }
  })
}

function saveWorkout(req, res) {
  console.log('this is req.body', req.body);
  console.log('this is req.files', req.files);

  let picture = !!req.files.pictureFile ? req.files.pictureFile[0].filename : req.body.pictureURL;
  let video = !!req.files.videoFile ? req.files.videoFile[0].filename : req.body.videoURL;

  var newWorkout = {
    type: req.body.type,
    name: req.body.name,
    description: req.body.description,
    difficulty: req.body.difficulty,
    picture,
    muscleGroup: req.body.musclegroup,
    videoURL: video,
    createdBy: req.session.name
  };

  Exercise.find({createdBy: req.session.name, name: req.body.name}, function(err, user) {
    console.log('it gets inside of exercise.find')
    if (err) throw err;
    if (user.length === 0) {
      Exercise.create(newWorkout, function(err, entry) {
        console.log('it gets inside exercise.create');
        if (err) throw err;
        res.send(newWorkout);
      });
    } else {
      res.send('This workout already exists');
    }
  });
}

function getHistory(req, res) {
  var name = req.query.username;
  User.findOne({username: name}, function(err, data) {
    if(err) {
      console.log('err happened with cooldown retrieval: ' + err);
    } else{
      res.send(data.workoutHistory);
    }
  });
}

function getWorkout(req, res) {
  var returnObj = [];

  Exercise.find({type: 'warmup'}, function(err,data) {
    if(err) {
      console.log('err happened with cooldown retrieval: ' + err);
    } else {
      returnObj.push(data[Math.floor(Math.random()*data.length)]);
      returnObj.push(data[Math.floor(Math.random()*data.length)]);
      returnObj.push(data[Math.floor(Math.random()*data.length)]);

      Exercise.find({type: 'workout'}, function(err,data) {
        if(err) {
          console.log('err happened with cooldown retrieval: ' + err);
        } else {
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);
          returnObj.push(data[Math.floor(Math.random()*data.length)]);

          Exercise.find({type: 'cooldown'}, function(err,data) {
            if(err) {
              console.log('err happened with cooldown retrieval: ' + err);
            } else {
              returnObj.push(data[Math.floor(Math.random()*data.length)]);
              returnObj.push(data[Math.floor(Math.random()*data.length)]);
              returnObj.push(data[Math.floor(Math.random()*data.length)]);

              console.log('exercise data sent succesfully');
              res.status('200').send(returnObj);
            }
          });
        }
      });
    }
  });
}

function addWorkout(req, res) {
  var name = req.body.username;
  var workoutObj = {};
  workoutObj.currentWorkout = req.body.currentWorkout;
  workoutObj.date = req.body.date;
  workoutObj.lengthOfWorkout = req.body.lengthOfWorkout;

  User.findOne({username: name}, function(err, user) {
    if (err) {
      console.log('err happened with cooldown retrieval: ' + err);
    } else {
      user.workoutHistory.unshift(workoutObj);
      user.save(function(err) {
        if (err) {
          console.log(err + ' error happened!');
        } else {
          console.log('user workouts updated');
          res.status(202).send('user workout history updated');
        }
      });
    }
  });
}


function checkLogin(req, res) {
  var name = req.body.username;
  var pass = req.body.password;

  User.findOne({username:name}, function(err, data) {
    if (err) {
      console.log("Database access error" + err);
    } else {
      if (data) {
        if (bcrypt.compareSync(pass, data.password)=== true) {
          req.session.name = name
          res.status(200).send('Log in success');
        } else {
          res.status(400).send('Log in attempt failed');
        }
      } else {
        res.status(400).send('Log in attempt failed');
      }
    }
  });
}


function checkSession(req, res) {
  if (req.session.name) {
    User.findOne({username: req.session.name}, function(err, data) {
      if (err) {
        console.log("Database access error" + err);
      } else {
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(400).send(false);
        }
      }
    });
  }
}


function addSignup(req, res) {
  var name = req.body.username;
  var pass = req.body.password;
  var workoutList = req.body.workoutList;
  var hash = bcrypt.hashSync(pass, salt);
  var id = new ObjectID();

  User.find({username: name}, function(err, user) {
    if (err) {
      console.log("Database access error" + err);
    } else {
      if (!user[0]) {
        var newUser = new User({
          _id: id,
          username: name,
          password: hash,
          preferences: {},
          workoutList: workoutList
        });
        newUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            req.session.name = name;
            res.status(200).send('User Created');
          }
        });
      } else {
        res.status(400).send('User exists');
      }
    }
  });
}

function destroyCookie(req, res) {
  req.session.destroy(function(err) {
    if (err) { throw err };
    res.status(200).end();
  });
}

function addExerciseToUser(req, res) {
  User.update({username: req.body.username}, {$push: {workoutList: req.body.exercise}}, function(err, data) {
    if (err) {
      res.status(400).end('err not added!')
    } else {
      res.status(200).send('successfully added exercise to user');
    }
  })
}

function removeExerciseFromUser(req, res) {
  var ex = req.body.exercise;
  User.update({username: req.body.username}, {$pull: {workoutList: {name: ex.name}}}, function(err, data) {
    if (err) {
      console.log('err deleting from db')
    } else {
      res.status(200).send('successfully deleted');
    }
  })
}











