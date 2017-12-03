var History = (props) => (
  <div className="history">
    <h1> History </h1>
    {props.loggedIn && props.workoutHistory.map(indivWorkout => <PastWorkout date={indivWorkout.date} lengthOfWorkout={indivWorkout.lengthOfWorkout} key={Math.random() * 1000}/>)}
    {!props.loggedIn && (<span className='historyNotLoggedIn'>You are not currently logged in. Please Log In or Sign Up to view Workout History.</span>)}
  </div>
);


window.History = History;
