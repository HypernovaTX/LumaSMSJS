import { createContext, useMemo, useState } from 'react';
import { noop } from 'lodash-es';

import { PermissionKind, User } from 'schema/userSchema';
import { ContextProps } from 'schema';
import { useAPI_verify, useAPI_permissions } from 'api';

// Init context
type UserContextType = {
  checkPermit: (p: PermissionKind) => boolean;
  clearUser: () => void;
  loading: boolean;
  loadUser?: () => void;
  login: boolean;
  logoutError?: boolean;
  permission: PermissionKind[];
  setUser: (u: User) => void;
  user?: User;
};
const defaultUserContext: UserContextType = {
  checkPermit: () => {
    return false;
  },
  clearUser: noop,
  loading: false,
  login: false,
  permission: [],
  setUser: noop,
};
export const UserContext = createContext<UserContextType>(defaultUserContext);

// Main Provider
export default function UserProvider(props: ContextProps) {
  // State
  const [login, setLogin] = useState(false);
  const [permission, setPermission] = useState<PermissionKind[]>([]);
  const [user, setUser] = useState<User | undefined>(undefined);

  // Data
  // - User validation
  const { loading: loadU, execute: loadUser } = useAPI_verify({
    skip: login,
    onComplete: completeUserData,
    onError: clearUser,
  });
  // - User permission
  const { loading: loadP, execute: loadPermit } = useAPI_permissions({
    skip: true,
    onComplete: setPermission,
    onError: clearUser,
  });

  // Memo
  const loading = useMemo(loadingMemo, [loadP, loadU]);

  // Output
  return (
    <UserContext.Provider
      value={{
        checkPermit,
        clearUser,
        loading,
        loadUser: loadUser,
        login,
        permission,
        setUser,
        user,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );

  // Data hoists
  function completeUserData(data?: User) {
    setUser(data);
    setLogin(true);
    loadPermit();
  }
  function clearUser() {
    setLogin(false);
    setUser(undefined);
    setPermission([]);
  }

  // Special functions
  function checkPermit(permit: PermissionKind) {
    return permission.includes(permit);
  }

  // Memo hoists
  function loadingMemo() {
    return loadU || loadP;
  }
}
