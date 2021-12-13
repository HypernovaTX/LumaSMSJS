import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { A } from 'components';

import theme from 'MUIConfig';

export default function Footer() {
  // Variables
  const year = new Date().getFullYear();

  // Custom hooker
  const { t } = useTranslation();

  // Output
  return (
    <Box py={4}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography align="center">{t('footer.disclaimer')}</Typography>
            <Typography align="center">&nbsp;</Typography>
            <Typography align="center">
              {t('footer.copyright', { year })}
              <A url="https://github.com/HypernovaTX">Hypernova</A> 
              {' & '}
              <A url="https://mors-games.com/">Mors</A>
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>  
            <Typography align="center"><A url="#">{t('footer.links.about')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.faq')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.rules')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.staff')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.affiliates')}</A></Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography align="center"><A url="#">{t('footer.links.newsArchive')}</A></Typography>
            <Typography align="center"><A url="http://wiki.mfgg.net/">{t('footer.links.wiki')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.privacy')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.cookie')}</A></Typography>
            <Typography align="center"><A url="#">{t('footer.links.contact')}</A></Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
