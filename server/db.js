var mongoose = require('mongoose');
var dbUri = require('./dbInfo').dbUri;
var Schema = mongoose.Schema;


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Connection to MongoDB instance
* * * * * * * * * * * * * * * * * * * * * * * * * * */

mongoose.connect('mongodb://' + dbUri);
var db = mongoose.connection;

db.on('connected', function() {
  console.log('database is connected');
});

db.on('error', function(error) {
  console.log('database connection error: ' + error);
});


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Definition of Schemas
* * * * * * * * * * * * * * * * * * * * * * * * * * */

var exerciseSchema = new Schema({
  name: String,
  description: String,
  type: String,
  videoURL: String,
  videoFilename: String,
  createdBy: String,
  picture: String,
  environment: String,
  muscleGroup: String,
  difficulty: String
});

var userSchema = new Schema({
  username: String,
  password: String,
  preferences: {},
  workoutHistory: []
});


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
   Model Creation based on Schemas
* * * * * * * * * * * * * * * * * * * * * * * * * * */

var Exercise = mongoose.model('Exercise', exerciseSchema);
var User = mongoose.model('User', userSchema);

module.exports.exerciseModel = Exercise;
module.exports.userModel = User;
module.exports.mongoose = mongoose;

