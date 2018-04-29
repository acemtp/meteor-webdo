import React from 'react';
import UserSmall from './small';
import { CurrentUser } from './currentUser';


const Friends = () => (
  <CurrentUser>
    {({loading, data }) => {
      if (loading) return <div>loading ...</div>;

      const { currentUser } = data;
      if (!currentUser || !currentUser.profile || !currentUser.profile.friends) return <div>no friends found</div>;

      const { friends } = currentUser.profile;
      return (<div className=".currentUser-list">{friends.map(userId => <UserSmall userId={userId} key={userId} />)}</div>);
    }}
  </CurrentUser>
);

export default Friends;
