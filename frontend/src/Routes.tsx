import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Error from 'Error';
import Login from 'User/Login';

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Error} />
      <Route exact path="/login" component={Login} />
    </Switch>
  );
}
