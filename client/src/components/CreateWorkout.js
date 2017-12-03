class CreateWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    let form = document.querySelector("form");
    let formData = new FormData(form);
    console.log(form);
    console.log(formData.get('name'));
    this.props.submitExercise(formData);
  }

 render() {
  return (
    <div>
      <form method="POST" encType="multipart/form-data" onSubmit={this.handleSubmit} >
        <div>
          <label className="createWorkout">Exercise Type:
            <select className="workoutType" name="type" required>
              <option value="warmup">Warm Up</option>
              <option value="workout">Workout</option>
              <option value="cooldown">Cooldown</option>
            </select>
          </label>
        </div>
        <div>
          <label className="createWorkout">Name:
            <input type="text" name="name" required />
          </label>
          <br />
        </div>
          <label className="createWorkout">Description:
            <input type="text" name="description" className="description" required />
          </label>
          <br />
        <div>
          <label className="createWorkout">Upload Video:
            <input type="file" name="videoFile" accept="video/*" />
          </label>
          <br />
        </div>
        <div>
          <label className="createWorkout">Video URL (optional):
            <input type="text" name="videoURL" />
          </label>
          <br />
        </div>
        <div>
          <input type="submit" value="Submit" className="btn-createWorkout-Form" />
        </div>
      </form>
      {this.props.visible ? <p style={{'color': 'green'}} > Your Workout has been submitted. </p> : <span></span>}
    </div>
    )
  }
}



window.CreateWorkout = CreateWorkout;