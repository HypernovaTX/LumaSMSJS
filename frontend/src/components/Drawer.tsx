import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'theme/styles';

export const LumaDrawer = styled(Drawer)({
  '& > .MuiPaper-root': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.dark,
    minWidth: '75vw',
  },
});
