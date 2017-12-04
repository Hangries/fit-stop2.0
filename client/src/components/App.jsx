class App extends React.Component {
  constructor() {
    super();
    this.state = {
      currentState: 'Dashboard',
      currentWorkout: window.exampleExerciseData,
      currentExercise: 0,
      workoutDate: null,
      workoutHistory: [],
      username: null,
      loggedIn: false,
      countdown: 3,
      time: null,
      showButtons: true,
      workoutLengthInMins: 15,
      elapsedTime: null,
      completedWorkouts: [],
      expendedCalories: 0,
      userWeight: 160
    };

    this.getUserInfo();
    this.goToWorkout = this.goToWorkout.bind(this);
    this.goToSummary = this.goToSummary.bind(this);
    this.goToDashboard = this.goToDashboard.bind(this);
    this.goToCountdown = this.goToCountdown.bind(this);
    this.goToLogin = this.goToLogin.bind(this);
    this.goToSignUp = this.goToSignUp.bind(this);
    this.goToProfile = this.goToProfile.bind(this);
    this.getWarmups = this.getWarmups.bind(this);
    this.getWorkoutHistory = this.getWorkoutHistory.bind(this);
    this.sendWorkoutData = this.sendWorkoutData.bind(this);
    this.logOut = this.logOut.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.createWorkout = this.createWorkout.bind(this);
    this.submitExercise = this.submitExercise.bind(this);
    // this.getWarmups();
  }

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Checks if user session is persistent (v2.0)
* * * * * * * * * * * * * * * * * * * * * * * * * * */

  getUserInfo() {
    // this.getExercises();
    // setTimeout(() => {
      $.ajax({
        method: 'GET',
        url: '/islogged',
        success: (data) => {
          console.log('this is the data back from the server', data);
          if (data) {
          this.setState({username: data});
          this.setState({loggedIn: true});
          this.goToDashboard();
          }
        },
        error: (err) => {
          console.log('componentDidMount failed to fetch');
        }
      });
    // }, 800);
  }


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  The following functions change the view on the app
* * * * * * * * * * * * * * * * * * * * * * * * * * */

  goToDashboard() {
    this.setState({currentState: 'Dashboard'});
    this.setState({showButtons: true});
    if (this.state.loggedIn) {
      this.getWorkoutHistory();
    }
    if (this.state.interval) {
      clearInterval(this.state.interval);
    }
  }

  goToProfile() {
    this.setState({currentState: 'Profile'});
  }

  goToLogin() {
    this.setState({currentState: 'Login'})
  }

  goToSignUp() {
    this.setState({currentState: 'SignUp'})
  }

  goToCountdown() {
    this.setState({currentState: 'Countdown'});
    this.setState({showButtons: false});
    this.setState({currentExercise: 0});
   // this.getExercises(); //uncomment to fetch from db
    this.startCountdown();
  }

  goToWorkout() {
    this.setState({currentState: 'Workout'});
    this.startTimer();
  }

  goToSummary() {
    this.setState({currentState: 'Summary'});
    this.setState({showButtons: true});
    var currentDate = Date();
    this.setState({workoutDate: currentDate});
    clearInterval(this.state.interval);
    if (this.state.loggedIn) {
      this.sendWorkoutData();
    }
  }

  createWorkout() {
    this.setState({
      currentState: 'createWorkout'
    });
  }


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  The following functions send requests to the server
* * * * * * * * * * * * * * * * * * * * * * * * * * */
  getWarmups() {
    $.ajax({
      method: 'GET',
      url: '/warmups',
      success: (data) => {
        console.log('in client: warmups:', data)
      },
      error: (err) => {
        console.log('err getting warmups in client:', err)
      }
    })
  }

  getSavedWorkouts() {
    $.ajax({
      method: 'GET',
      url: '/savedWorkouts',
      dataType: 'json',
      data: {username: this.state.username},
      complete:(data) => {
        console.log('success', data)
      },
      error: (err) => {
        console.log('err', err)
      }
    })
  }

  getWorkoutHistory() {
    $.ajax({
      method: 'GET',
      url: '/history',
      dataType: 'json',
      data: {
        username: this.state.username
      },
      complete: (data) => {
        var firstFive = JSON.parse(data.responseText).slice(0, 5);
        this.setState({workoutHistory: firstFive})
      },
      error: function(err) {
        console.error(err);
      }
    });
  }

  getExercises() {
    $.ajax({
      method: 'GET',
      url: '/workout',
      dataType: 'json',
      data: {
        lengthOfWorkout: this.state.workoutLengthInMins
      },
      complete: (data) => {
        console.log('exercise data:', data);
        this.setState({currentWorkout: JSON.parse(data.responseText)})
      },
      error: function(err) {
        console.error(err);
      }
    });
  }

  sendWorkoutData() {
    $.ajax({
      type: 'POST',
      url: '/addWorkout',
      data: JSON.stringify({
        username: this.state.username,
        date: Date(),
        currentWorkout: this.state.currentWorkout,
        lengthOfWorkout: this.state.workoutLengthInMins
      }),
      contentType: 'application/json',
      dataType: 'json',
      success: function (data) {
        console.log('succesfully posted data!');
      }
    });
  };

  login(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var username = data.get('username');
    var password = data.get('password');

    $.ajax({
      type: "POST",
      url: '/login',
      data: JSON.stringify({
        username: username,
        password: password
      }),
      contentType: 'application/json',
      dataType: 'json',
      complete: data => {
        if (data.responseText === "Log in success") {
          this.setState({username: username});
          this.setState({loggedIn: true});
          this.goToDashboard();
        } else {
          alert("Username and Password Invalid");
          this.goToLogin();
        }
      }
    });
  }

  signup(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var username = data.get('username');
    var password = data.get('password');

    $.ajax({
      type: "POST",
      url: '/signup',
      data: JSON.stringify({
        username: username,
        password: password
      }),
      contentType: 'application/json',
      dataType: 'json',
      complete: data => {
        if (data.responseText === "User Created") {
          this.setState({username: username});
          this.setState({loggedIn: true});
          this.goToDashboard();
        } else {
          alert("Username and Password Invalid");
          this.goToSignUp();
        }
      }
    });
  }

  logOut() {
    this.setState({loggedIn: false});
    this.setState({username: null});

    // Delete cookies on Server-side
    $.ajax({
      type: 'GET',
      url: '/destroyCookie',
      success: () => {console.log('user logged out')},
      error: () => {console.log('logout failed')}
    });

    // Delete cookies on Client-side
     var cookies = document.cookie.split(";");
     for (var i = 0; i < cookies.length; i++) {
       deleteCookie(cookies[i].split("=")[0]);
     }

    this.goToDashboard();
  }

  submitExercise(exerciseData) {
    $.ajax({
      type: 'POST',
      url: '/createworkout',
      data: exerciseData,
      contentType: false,
      processData: false,
      success: (data) => {console.log('Success in the form submission: ', data)},
      error: () => {console.log('Form submission failed on the AJAX POST request')}
    });

    this.setState({
      visible: !this.state.visible
    })
  }


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Countdown and Timer Functions
* * * * * * * * * * * * * * * * * * * * * * * * * * */

  startCountdown() {
    this.setState({countdown: 3});
    var interval= setInterval(this.countdown.bind(this), 1000);
    this.setState({interval: interval});
  }

  countdown() {
    var current = this.state.countdown;
    current--;
    this.setState({countdown: current});
    if (this.state.countdown === 0) {
      clearInterval(this.state.interval);
      this.goToWorkout();
    }
  }

  startTimer() {
    var current = this.state.workoutLengthInMins * 60;
    this.setState({time: current});
    var interval = setInterval(this.timer.bind(this), 1000);
    this.setState({interval: interval});
  }

timer() {
    var completedWorkouts = this.state.completedWorkouts;
    var current = this.state.time;
    var elapsedTime = 900 - current;
    var caloriesBurned = 0;
    current--;
    this.setState({time: current, elapsedTime: elapsedTime});
    if (this.state.time <= 0) {
      this.goToSummary();
    } else if (this.state.time % 60 === 0) {
      var next = this.state.currentExercise;
      var currentExercise = this.state.currentWorkout[next];
      completedWorkouts.push(currentExercise)
      var expCal = this.state.expendedCalories + this.state.userWeight * currentExercise.metValue * (1 / 60);
      this.setState({expendedCalories: Math.round(expCal)});
      next++;
      this.setState({currentExercise: next, completedWorkouts: completedWorkouts});
      this.refs.workoutPage.highlightActiveTitle();
    }
  }

  formatTime(seconds) {
    var mm = Math.floor(seconds / 60);
    var ss = seconds % 60;
    if (ss < 10) {
      ss = '0' + ss;
    }
    return mm + ':' + ss;
  }

  formatSummaryTime(seconds) {
    var mm = Math.floor(seconds / 60);
    var ss = seconds % 60;
    if (ss < 10) {
      ss = '0' + ss;
    }
    return mm + ' minutes' + ' : ' + ss + ' seconds';
  }


/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Renders the components based ot the current state
* * * * * * * * * * * * * * * * * * * * * * * * * * */

  render() {
    var toBeRendered = () => {
      if (this.state.currentState === 'Dashboard') {
        return (<Dashboard goToCountdown={this.goToCountdown} workoutHistory={this.state.workoutHistory} loggedIn={this.state.loggedIn} />);
      }
      if (this.state.currentState === 'Login') {
          return (<Login login={this.login} goToDashboard={this.goToDashboard}/>);
      }
      if (this.state.currentState === 'SignUp') {
          return (<SignUp signup={this.signup} goToDashboard={this.goToDashboard} />);
      }
      if (this.state.currentState === 'Countdown') {
          return (<Countdown countdown={this.state.countdown} />);
      }
      if (this.state.currentState === 'Workout') {
        return (<Workout exercise={this.state.currentWorkout[this.state.currentExercise]} timer={this.formatTime(this.state.time)} countdown={this.state.countdown} goToSummary={this.goToSummary} goToDashboard={this.goToDashboard} ref="workoutPage" />);
      }
      if (this.state.currentState === 'createWorkout') {
        return (<CreateWorkout submitExercise={this.submitExercise} visible={this.state.visible} />);
      }
      if (this.state.currentState === 'Profile') {
        return ( <Profile />)
      }

      if (this.state.currentState === 'Summary') {
        return (<Summary
          goToDashboard={this.goToDashboard}
          currentWorkout={this.state.currentWorkout}
          workoutDate={this.state.workoutDate}
          loggedIn={this.state.loggedIn}
          elapsedTime={this.state.elapsedTime}
          formatTime={this.formatSummaryTime}
          completedWorkouts={this.state.completedWorkouts}
          expendedCalories={this.state.expendedCalories}/>);
      }
    }

    return (
      <div className = "App">
        <Header username={this.state.username} goToLogin={this.goToLogin} goToSignUp={this.goToSignUp} loggedIn={this.state.loggedIn} logOut={this.logOut} showButtons={this.state.showButtons} createWorkout={this.createWorkout} goToProfile={this.goToProfile}/>
        {toBeRendered()}
      </div>
    )
  }

} // End of Class

window.App = App;