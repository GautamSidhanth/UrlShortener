import { Box, Container, Stack, Typography, Link } from '@mui/material';
import React from 'react';

const Footer = (): React.JSX.Element => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(11, 15, 25, 0.5)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </Typography>
          
          <Stack direction="row" spacing={3}>
            <Link href="#" color="text.secondary" underline="hover">
              Privacy
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Terms
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Contact
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
