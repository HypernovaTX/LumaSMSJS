import { Avatar, Box, Grid, Skeleton } from '@mui/material';
import { LumaText } from 'components';
import CF from 'config';
import { User } from 'schema/userSchema';
import { styles } from 'theme/styles';

interface UserListItemProps {
  user?: User;
  loading?: boolean;
}

export default function UserListItem(props: UserListItemProps) {
  // Const
  const avatar = props.user?.avatar_file
    ? `${CF.HOST}${CF.UPLOAD_DIR}/avatar/${props.user.avatar_file}`
    : undefined;

  // Output
  return (
    <Box mx={2} my={2}>
      <Grid container wrap="nowrap">
        <Grid item container xs="auto" alignItems="center">
          <Box width={64} textAlign="center"></Box>
        </Grid>
        <Grid item xs="auto">
          {props.loading ? (
            <Skeleton
              sx={{
                width: 80,
                height: 80,
              }}
            />
          ) : (
            <Avatar
              src={avatar}
              style={styles.avatarMedium}
              variant="rounded"
              alt={props.user?.username}
            />
          )}
        </Grid>
        <Grid item xs={2}>
          <LumaText>{props.user?.username}</LumaText>
          <LumaText>{props.user?.uid}</LumaText>
        </Grid>
      </Grid>
    </Box>
  );
}
