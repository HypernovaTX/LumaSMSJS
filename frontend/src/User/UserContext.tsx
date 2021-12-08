import { createContext, useEffect, useMemo, useState } from 'react';

import { User } from 'schema/userSchema';
import { ContextProps, ErrorObj } from 'schema';
import { useAPI_verify, useAPI_image } from 'API';
import { isError } from 'lib';

// Init context
type UserContextType = {
  user?: User;
  permission: string[];
  login: boolean;
  loaded: boolean;
  avatar?: string;
  error?: ErrorObj;
  reloadUser?: () => void;
};
const defaultUserContext: UserContextType = {
  permission: [],
  login: false,
  loaded: false,
};
export const UserContext = createContext<UserContextType>(defaultUserContext);

// Main Provider
export default function UserProvider(props: ContextProps) {
  // State
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  // Data
  const {
    data: userData,
    requested: userLoaded,
    execute: reloadUser,
  } = useAPI_verify(login, (data) => {
    if (!isError(data)) {
      reloadAvatar({
        path: `avatar/${data?.avatar_file ?? ''}`,
      });
    }
  });
  const {
    data: avatarData,
    requested: avatarLoaded,
    execute: reloadAvatar,
  } = useAPI_image(true, {
    path: `avatar/${user?.avatar_file ?? ''}`,
  });

  // Memo
  const error = useMemo(errorMemo, [userData]);
  const loaded = useMemo(loadedMemo, [userLoaded, avatarLoaded]);
  const avatar = useMemo(avatarMemo, [avatarData]);

  // Effects
  useEffect(userEffect, [userData]);
  useEffect(loginEffect, [loaded, userData]);

  // Output
  return (
    <UserContext.Provider
      value={{
        user,
        permission: [],
        login,
        loaded,
        error,
        avatar,
        reloadUser,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );

  // Memo hoists
  function errorMemo() {
    if (isError(userData)) {
      return userData as ErrorObj;
    }
    return undefined;
  }

  function loadedMemo() {
    return userLoaded && avatarLoaded;
  }

  function avatarMemo() {
    if (!avatarData) return undefined;
    if (isError(avatarData)) return undefined;
    const avatarFile = window.URL.createObjectURL(new Blob([avatarData]));
    console.log(avatarFile);
    return avatarFile;
  }

  // Effect hoists
  function userEffect() {
    if (userData && !isError(userData)) {
      setUser(userData as User);
    }
  }

  function loginEffect() {
    if (userData && !isError(userData) && loaded) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  }
}
