import React, { useContext } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  styled,
} from '@mui/material';
import { LumaButton } from 'components';
import { useTranslation } from 'react-i18next';
import theme from 'MUIConfig';
import { GlobalContext } from 'global/GlobalContext';

const CustomDiaglog = styled(Dialog)({
  '& .MuiPaper-root': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiPaper-root h2': {
    backgroundColor: theme.palette.primary.dark,
  },
  '& .MuiDialogContent-root': {
    padding: '16px 24px',
    borderTop: 'none',
    borderBottom: 'none',
  },
  '& .MuiDialogActions-root': {
    backgroundColor: theme.palette.primary.dark,
    padding: '16px 24px',
  },
});

interface DiaglogProps {
  title: string;
  message: string;
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export function LumaDiaglog(props: DiaglogProps) {
  // Custom hooks
  const { t } = useTranslation();

  // Context
  const { isSmallMobile } = useContext(GlobalContext);

  // Output
  return (
    <CustomDiaglog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={props.open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="customized-dialog-title">{props.title}</DialogTitle>
      <DialogContent dividers>{props.message}</DialogContent>
      <DialogActions>
        <Grid
          container
          spacing={2}
          direction={isSmallMobile ? 'column' : 'row'}
          justifyContent="flex-end"
        >
          <Grid item>
            <LumaButton
              autoFocus
              onClick={handleConfirm}
              color="secondary"
              variant="contained"
              fullWidth={isSmallMobile}
            >
              {t('main.confirm')}
            </LumaButton>
          </Grid>
          <Grid item>
            <LumaButton
              onClick={handleClose}
              variant="contained"
              fullWidth={isSmallMobile}
            >
              {t('main.cancel')}
            </LumaButton>
          </Grid>
        </Grid>
      </DialogActions>
    </CustomDiaglog>
  );

  // Handles
  function handleConfirm() {
    if (props.onConfirm) props.onConfirm();
    handleClose();
  }
  function handleClose() {
    if (props.onClose) props.onClose();
  }
}
