import React, { createContext } from 'react';

import { User, UserPermissions } from 'schema/userSchema';
import { ContextProps } from 'schema';

type UserContextType = {
  user: User;
  permission: string[];
};

const defaultUserContext: UserContextType = {
  user: {},
  permission: [],
};

const UserContext = createContext<UserContextType>(defaultUserContext);

function UserProvider(props: ContextProps) {}
