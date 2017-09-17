import React from 'react';

function userImage(user) {
  const url = user.profile.avatar || '/photo/anonymous.gif';
  const imageUrl = url.indexOf('http') === 0 ? url : `http://webdo.ploki.info${url}`;
  return imageUrl.indexOf('googleusercontent') === -1 ? `http://res.cloudinary.com/webdo/image/fetch/w_400,h_400,c_scale,c_fill,f_auto/${imageUrl}` : imageUrl;
}

export class Img extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: this.props.src,
    };
  }
  errorHandler() {
    if (this.state.src === this.props.fallback) return;
    this.setState({ src: this.props.fallback });
  }
  render() {
    return (<img src={this.state.src} alt={this.props.alt} onError={this.errorHandler.bind(this)} />);
  }
}

export class UserPicture extends React.Component {
  render() {
    return (
      <Img src={userImage(this.props.user)} alt={this.props.user.username} fallback='/photo/anonymous.gif' />
    );
  }
}


export class UserAvatar extends React.Component {
  render() {
    return (
      <a className="user-small" href={Router.path('user', this.props.user)}>
        <div className="user-small-Image">
          <UserPicture user={this.props.user} />
        </div>
        <div className="user-small-title">{this.props.user.username}</div>
      </a>
    );
  }
}

export class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }
  render() {
    return (
      <div className=".user-list">{this.props.users.map(user => <UserAvatar key={user._id} user={user} />)}</div>
    );
  }
}
