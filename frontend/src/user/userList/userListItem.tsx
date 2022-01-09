import { Avatar, Box, Grid } from '@mui/material';
import CF from 'config';
import { User } from 'schema/userSchema';

interface UserListItemProps {
  user?: User;
  loading?: boolean;
}

export default function UserListItem(props: UserListItemProps) {
  return (
    <Box>
      <Grid container wrap="nowrap">
        <Grid item xs="auto">
          <Avatar
            src={`${CF.HOST}${CF.UPLOAD_DIR}/avatar/${props.user?.avatar_file}`}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
