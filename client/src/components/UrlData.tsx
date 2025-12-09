import { useEffect, useState } from 'react';

import { Alert, IconButton, Link, Paper, Stack, Typography, Tooltip, Zoom } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LaunchIcon from '@mui/icons-material/Launch';
import { copyToClipboard } from '../utils';

interface UrlDataType {
  isSuccess: boolean;
  isError: boolean;
  shortenUrlKey: string | undefined;
}

const UrlData = ({
  isSuccess,
  isError,
  shortenUrlKey,
}: UrlDataType): React.JSX.Element => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Fallback to empty string if undefined to avoid runtime errors, though logic handles it
  
  // Use VITE_PUBLIC_BASE_URL from env if available, otherwise fallback to window.location.origin
  const publicBase = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const shortenUrl = shortenUrlKey ? `${publicBase}/${shortenUrlKey}` : '';

  const handleOnClick = (): void => {
    copyToClipboard(shortenUrl);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!isSuccess && !isError) return <></>;

  return (
    <Zoom in={isSuccess || isError}>
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          width: '100%',
          p: 3,
          background: isError 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(99, 102, 241, 0.1)', // Indigo tint
          border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          backdropFilter: 'blur(10px)',
          borderRadius: 2, // 2 * 16 = 32px, nice and round but not pill
        }}
      >
        {isSuccess ? (
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontWeight: 600 }}>
              Your Short Link
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems="center" 
              justifyContent="space-between"
              spacing={2}
              sx={{
                p: 2,
                bgcolor: 'rgba(11, 15, 25, 0.3)',
                borderRadius: 1, // 16px
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <Link
                target='_blank'
                rel="noopener noreferrer"
                color="white"
                href={shortenUrl}
                underline="hover"
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 600,
                  wordBreak: 'break-all',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontFamily: 'Monospace' // Better for URLs
                }}
              >
                {shortenUrl}
                <LaunchIcon fontSize="small" sx={{ opacity: 0.7 }} />
              </Link>

              <Tooltip title={isCopied ? "Copied!" : "Copy to clipboard"} placement="top">
                <IconButton
                  onClick={handleOnClick}
                  sx={{ 
                    color: isCopied ? '#10B981' : 'white',
                    bgcolor: isCopied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {isCopied ? <DoneAllIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ) : (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ border: 'none', bgcolor: 'transparent', p: 0, color: 'error.light' }}
          >
             Oops, something went wrong. Please try again.
          </Alert>
        )}
      </Paper>
    </Zoom>
  );
};

export default UrlData;