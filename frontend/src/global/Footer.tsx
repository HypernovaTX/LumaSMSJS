import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import theme from 'MUIConfig';

export default function Footer() {
  // Variables
  const year = new Date().getFullYear();

  // Custom hooker
  const { t } = useTranslation();

  // Output
  return (
    <Box py={4} sx={{ backgroundColor: theme.palette.primary.dark }}>
      <Container>
        <Typography>{t('footer.copyright', { year })}</Typography>
      </Container>
    </Box>
  );
}
