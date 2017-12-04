class Profile extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="user-profile">
        Welcome to Profile page
        <div className="profile-nav-buttons">
          <button className="blackButton" >Users Exercise List</button>
          <button className="blackButton" >FitStop Exercise List</button>
          <button className="blackButton" >Your Exercise List</button>
          <button className="blackButton" >Profile</button>
        </div>
      </div>
    )
  }
}


window.Profile = Profile;