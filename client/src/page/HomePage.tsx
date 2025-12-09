import { Typography, Box, Container } from '@mui/material';
import { useSubmitUrlMutation } from '../slices/urlsApiSlice';
import UrlData from '../components/UrlData';
import UrlForm from '../components/UrlForm';
import { useState, useEffect } from 'react';

const HomePage = (): React.JSX.Element => {
  const [
    trigger,
    {
      data,
      isLoading,
      isSuccess,
      isError,
    },
  ] = useSubmitUrlMutation();
  const [showResult, setShowResult] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) {
      setShowResult(true);
    }
  }, [isSuccess]);

  return (
    <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 6 }}>
        <Typography
          component="h1"
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(to right, #818cf8, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '800px',
          }}
        >
          Shorten Your Links, <br />
          Expand Your Reach
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 6, maxWidth: '600px', lineHeight: 1.6, fontWeight: 400 }}
        >
          Transform your long, messy links into short, memorable URLs in seconds. 
          Track your clicks and manage your links with ease.
        </Typography>
        
        <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }}>
          <UrlForm
            isSuccess={isSuccess}
            isLoading={isLoading}
            trigger={(originalUrl: string) => trigger({ originalUrl })}
            onInputChange={() => setShowResult(false)}
          />
        </Box>

        {showResult && (
          <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }}>
             <UrlData
              isSuccess={isSuccess}
              isError={isError}
              shortenUrlKey={data}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;