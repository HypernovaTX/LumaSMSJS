import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Error from 'Error';
import Login from 'User/Login';

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Error} />
        <Route exact path="/login" component={Login} />
      </Switch>
    </BrowserRouter>
  );
}
