import { AppBar, Box, Button, Container, Stack, Toolbar, Typography, useScrollTrigger } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = (): React.JSX.Element => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar 
      position="sticky" 
      elevation={trigger ? 4 : 0}
      sx={{
        backgroundColor: trigger ? 'rgba(11, 15, 25, 0.8)' : 'transparent',
        borderBottom: trigger ? '1px solid rgba(255,255,255,0.05)' : 'none',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1.5} 
            component={Link} 
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                p: 0.8,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LinkIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              URL Shortener
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<GitHubIcon />}
              href="https://github.com/GautamSidhanth/UrlShortener.git"
              target="_blank"
              color="inherit"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.08)' } 
              }}
            >
              GitHub
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ px: 3 }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
