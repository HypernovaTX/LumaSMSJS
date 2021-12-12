import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Error from 'error';
import Error404 from 'error/Error404';
import routes from 'route.config';
import Login from 'user/Login';
import Logout from 'user/Logout';

export default function Routes() {
  return (
    <Switch>
      {/* Root */}
      <Route exact path={routes._index} component={Error} />

      {/* User */}
      <Route exact path={routes.userLogin} component={Login} />
      <Route exact path={routes.userLogout} component={Logout} />
      <Route path="*" component={Error404} />
    </Switch>
  );
}
