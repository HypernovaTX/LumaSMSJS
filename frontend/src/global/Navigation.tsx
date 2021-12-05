import React from 'react';
import {
  AppBar,
  Box,
  Container,
  Grid,
  Input,
  Link,
  Typography,
} from '@mui/material';

export default function Navigation() {
  return (
    <div>
      <AppBar position="fixed">
        <Container>
          <Grid container>
            {/* Logo */}
            <Box>
              <Typography variant="h3">MFGG</Typography>
            </Box>
            {/* Nav */}
            <Box>
              <Link>Games</Link>
              <Link>Resources</Link>
              <Link>Forum</Link>
              <Input></Input>
            </Box>
          </Grid>
        </Container>
      </AppBar>
    </div>
  );
}
