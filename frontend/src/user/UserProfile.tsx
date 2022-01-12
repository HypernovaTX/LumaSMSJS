import React, { useContext, useMemo, useState } from 'react';

import { Box, Container, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { LumaText } from 'components';
import { GlobalContext } from 'global/GlobalContext';
import theme, { styles } from 'theme/styles';
import { useAPI_user } from 'api';

export default function UserProfile() {
  // Custom hooks
  const { t } = useTranslation();
  const { id: userIdParam } = useParams<{ id: string | undefined }>();

  // Context
  const { isMobile, toast } = useContext(GlobalContext);

  // States
  const [loading, setLoading] = useState(true);

  // Memo (pre-data)
  const selectedUser = useMemo(childComponentMemo, [userIdParam]);

  // Data
  const { data: user } = useAPI_user({
    body: { id: selectedUser },
    onComplete: () => setLoading(false),
    onError: (error) => {
      toast(error.message, 'error');
      setLoading(false);
    },
  });

  // Output
  return (
    <Box flex="1 0 auto" width="100%" style={styles.zigzagBG}>
      <Container maxWidth="xl">
        <Box width="100%" my={isMobile ? 2 : 4}>
          {loading ? (
            <Box display="flex" justifyContent="center">
              <Skeleton width="50%" height={isMobile ? 32 : 56} />
            </Box>
          ) : (
            <LumaText isTitle align="center">
              {user?.username || t('main.NA')}
            </LumaText>
          )}
        </Box>
        <Box
          width="100%"
          mb={isMobile ? 4 : 8}
          style={{ backgroundColor: theme.palette.primary.dark }}
        >
          UserID: {selectedUser}
        </Box>
      </Container>
    </Box>
  );

  // Memo hoists
  function childComponentMemo() {
    const uidNumber = userIdParam ? parseInt(userIdParam) : 0;
    if (Number.isNaN(uidNumber)) {
      return 0;
    }
    return uidNumber;
  }
}
