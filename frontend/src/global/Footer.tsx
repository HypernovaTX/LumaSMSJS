import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { A, LumaText } from 'components';
import route from 'route.config';

// import theme from 'MUIConfig';

export default function Footer() {
  // Variables
  const year = new Date().getFullYear();

  // Custom hooker
  const { t } = useTranslation();

  // Output
  return (
    <Box py={4}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <LumaText align="center">{t('footer.disclaimer')}</LumaText>
            <LumaText align="center">&nbsp;</LumaText>
            <LumaText align="center">
              {t('footer.copyright', { year })}
              <A url="https://github.com/HypernovaTX" newWindow>
                Hypernova
              </A>
              {' & '}
              <A url="https://mors-games.com/" newWindow>
                Mors
              </A>
            </LumaText>
          </Grid>
          <Grid item xs={6} md={3}>
            <LumaText align="center">
              <A url="#">{t('footer.links.about')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.faq')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.rules')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.staff')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.affiliates')}</A>
            </LumaText>
          </Grid>
          <Grid item xs={6} md={3}>
            <LumaText align="center">
              <A url="#">{t('footer.links.newsArchive')}</A>
            </LumaText>
            <LumaText align="center">
              <A url={route.urlWiki}>{t('footer.links.wiki')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.privacy')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.cookie')}</A>
            </LumaText>
            <LumaText align="center">
              <A url="#">{t('footer.links.contact')}</A>
            </LumaText>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
