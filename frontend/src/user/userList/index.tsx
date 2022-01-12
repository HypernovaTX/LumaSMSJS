import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Box, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import theme, { styles } from 'theme/styles';
import { useAPI_userCount, useAPI_userList } from 'api';
import { UserContext } from 'user/UserContext';
import { Count, GetUserListBody } from 'schema/api';
import { User } from 'schema/userSchema';
import UserListItem from './userListItem';

export default function UserList() {
  // Custom Hooks
  const { t } = useTranslation();

  // State
  const [requested, setRequested] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [userCount, setUserCount] = useState<number>();

  // Context
  const { isMobile } = useContext(GlobalContext);
  const { user } = useContext(UserContext);

  // Data
  const {
    execute: fetchList,
    loading: loadL,
    requested: doneL,
  } = useAPI_userList({
    skip: true,
    body: {},
    onComplete: listDataComplete,
  });
  const {
    execute: fetchCount,
    loading: loadC,
    requested: doneC,
  } = useAPI_userCount({
    skip: true,
    body: {},
    onComplete: countDataComplete,
  });

  // Memo / Const
  const loading = useMemo(() => loadL || loadC, [loadL, loadC]);
  const loaded = useMemo(() => doneL && doneC, [doneL, doneC]);
  const items = user?.items_per_page || 25;
  const tempUser = Array(items).fill({} as User);

  // Effects
  useEffect(initEffect, [
    fetchCount,
    fetchList,
    loaded,
    loading,
    requested,
    user,
  ]);

  // Output
  return (
    <Box flex="1 0 auto" width="100%" style={styles.zigzagBG}>
      <Container maxWidth="xl">
        <Box width="100%" my={isMobile ? 2 : 4}>
          <LumaText isTitle align="center">
            {t('user.userList')}
          </LumaText>
        </Box>
        <Box
          width="100%"
          mb={isMobile ? 4 : 8}
          style={{ backgroundColor: theme.palette.primary.dark }}
        >
          count: {`${userCount}`}
          {loaded
            ? userList.map((u, i) => (
                <UserListItem user={u} loading={loading} key={i} />
              ))
            : tempUser.map((u, i) => <UserListItem user={u} key={i} />)}
        </Box>
      </Container>
    </Box>
  );
  // Data hoists
  function listDataComplete(data: User[]) {
    setUserList(data);
  }
  function countDataComplete(data: Count) {
    const { count } = data;
    setUserCount(count);
  }

  // Effect hoist
  function initEffect() {
    if (user && !loading && !loaded && !requested) {
      const param: GetUserListBody = {
        count: user.items_per_page,
      };
      fetchList(param);
      fetchCount(param);
      setRequested(true);
    }
  }
}
