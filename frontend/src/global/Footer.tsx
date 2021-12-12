import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
                  <Link color="secondary" href="https://github.com/HypernovaTX">Hypernova</Link> 
                  {' & '}
                  <Link color="secondary" href="https://mors-games.com/">Mors</Link>
              </Typography>
              <Typography align="center">{t('footer.easterEgg')}</Typography>
              </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.about')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.faq')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.rules')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.staff')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.affiliates')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.patcher')}</Link></Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.newsArchive')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="http://wiki.mfgg.net/">{t('footer.links.wiki')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="http://forums.mfgg.net/">{t('footer.links.forums')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.privacy')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.cookie')}</Link></Typography>
                    <Typography align="center"><Link color="secondary" href="#">{t('footer.links.contact')}</Link></Typography>
                  </Grid>
                </Grid>
          </Container>
    </Box>
  );
}
