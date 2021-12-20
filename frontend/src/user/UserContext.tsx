import { createContext, useMemo, useState } from 'react';
import { noop } from 'lodash-es';

import { PermissionKind, User } from 'schema/userSchema';
import { ContextProps } from 'schema';
import { useAPI_verify, useAPI_image, useAPI_permissions } from 'api';
import { isError } from 'lib';

// Init context
type UserContextType = {
  avatar?: string;
  banner?: string;
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

  const [avatar, setAvatar] = useState<string>();
  const [banner, setBanner] = useState<string>();
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
  // - User avatar
  const { loading: loadA, execute: loadAvatar } = useAPI_image({
    skip: true,
    body: {
      path: `avatar/${user?.avatar_file ?? ''}`,
    },
    onComplete: updateAvatar,
    onError: updateAvatar,
  });
  // - User banner
  const { loading: loadB, execute: loadBanner } = useAPI_image({
    skip: true,
    body: {
      path: `banner/${user?.banner_file ?? ''}`,
    },
    onComplete: updateBanner,
    onError: updateBanner,
  });
  // - User permission
  const { loading: loadP, execute: loadPermit } = useAPI_permissions({
    skip: true,
    onComplete: setPermission,
    onError: clearUser,
  });

  // Memo
  const loading = useMemo(loadingMemo, [loadA, loadB, loadP, loadU]);

  // Output
  return (
    <UserContext.Provider
      value={{
        avatar,
        banner,
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
    if (data?.avatar_file) {
      loadAvatar({
        path: `avatar/${data.avatar_file ?? ''}`,
      });
    } else {
      setAvatar(undefined);
    }
    if (data?.banner_file) {
      loadBanner({
        path: `banner/${data.banner_file ?? ''}`,
      });
    } else {
      setBanner(undefined);
    }
  }
  function updateAvatar(data: any) {
    if (!data) setAvatar(undefined);
    if (isError(data)) setAvatar(undefined);
    const avatarFile = window.URL.createObjectURL(new Blob([data]));
    setAvatar(avatarFile);
  }
  function updateBanner(data: any) {
    if (!data) setBanner(undefined);
    if (isError(data)) setBanner(undefined);
    const bannerFile = window.URL.createObjectURL(new Blob([data]));
    setBanner(bannerFile);
  }
  function clearUser() {
    setLogin(false);
    setUser(undefined);
    setAvatar(undefined);
    setPermission([]);
  }

  // Special functions
  function checkPermit(permit: PermissionKind) {
    return permission.includes(permit);
  }

  // Memo hoists
  function loadingMemo() {
    return loadU || loadA || loadP || loadB;
  }
}
