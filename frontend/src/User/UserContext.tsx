import { createContext, useMemo, useState } from 'react';

import { User } from 'schema/userSchema';
import { ContextProps } from 'schema';
import { useAPI_verify, useAPI_image } from 'API';
import { isError } from 'lib';

// Init context
type UserContextType = {
  user?: User;
  permission: string[];
  login: boolean;
  loaded: boolean;
  avatar?: string;
  loadUser?: () => void;
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
  const [avatar, setAvatar] = useState<string>();
  const [user, setUser] = useState<User | undefined>(undefined);

  // Data
  // - User validation
  const { requested: userLoaded, execute: loadUser } = useAPI_verify({
    skip: login,
    onComplete: (data) => {
      setUser(data);
      setLogin(true);
      loadAvatar({
        path: `avatar/${data?.avatar_file ?? ''}`,
      });
    },
    onError: () => {
      setLogin(false);
      setUser({});
    },
  });
  // - User avatar
  const { requested: avatarLoaded, execute: loadAvatar } = useAPI_image({
    skip: true,
    body: {
      path: `avatar/${user?.avatar_file ?? ''}`,
    },
    onComplete: (data) => {
      updateAvatar(data);
    },
  });

  // Memo
  const loaded = useMemo(loadedMemo, [userLoaded, avatarLoaded]);

  // Output
  return (
    <UserContext.Provider
      value={{
        user,
        permission: [],
        login,
        loaded,
        avatar,
        loadUser: loadUser,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );

  // Special Callbacks
  function updateAvatar(data: any) {
    if (!data) setAvatar(undefined);
    if (isError(data)) setAvatar(undefined);
    const avatarFile = window.URL.createObjectURL(new Blob([data]));
    setAvatar(avatarFile);
  }

  // Memo hoists
  function loadedMemo() {
    return userLoaded && avatarLoaded;
  }
}
