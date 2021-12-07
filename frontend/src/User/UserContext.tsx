import { createContext, useMemo } from 'react';

import { User } from 'schema/userSchema';
import { ContextProps, ErrorObj } from 'schema';
import { useAPI_verify } from 'api';
import { isError } from 'lib';

type UserContextType = {
  user: User;
  permission: string[];
  login: boolean;
  loaded: boolean;
  error?: ErrorObj;
};

const defaultUserContext: UserContextType = {
  user: {},
  permission: [],
  login: false,
  loaded: false,
};

export const UserContext = createContext<UserContextType>(defaultUserContext);

export default function UserProvider(props: ContextProps) {
  // Data
  const { data: userData, loaded: userLoaded } = useAPI_verify();

  // Memo
  const user = useMemo(userMemo, [userData]);
  const error = useMemo(errorMemo, [userData]);
  const loaded = useMemo(loadedMemo, [userLoaded]);
  const login = useMemo(loginMemo, [loaded, userData]);

  // Output
  return (
    <UserContext.Provider
      value={{
        user,
        permission: [],
        login,
        loaded,
        error,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );

  // Memo hoists
  function userMemo() {
    if (userData && !isError(userData)) {
      return userData as User;
    }
    return {} as User;
  }

  function errorMemo() {
    if (isError(userData)) {
      return userData as ErrorObj;
    }
    return undefined;
  }

  function loadedMemo() {
    return userLoaded;
  }

  function loginMemo() {
    if (userData && !isError(userData) && loaded) {
      return true;
    }
    return false;
  }
}
