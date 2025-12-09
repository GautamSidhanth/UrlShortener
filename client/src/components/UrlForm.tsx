import { type ChangeEvent, useEffect, useState } from 'react';
import { TextField, InputAdornment, Paper, Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { isValidUrl } from '../utils';

interface UrlFormType {
  isSuccess: boolean;
  isLoading: boolean;
  trigger: (originalUrl: string) => void;
  onInputChange?: () => void;
}

const UrlForm = ({
  isSuccess,
  isLoading,
  trigger,
  onInputChange,
}: UrlFormType): React.JSX.Element => {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [onError, setOnError] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) {
      setOriginalUrl('');
    }
  }, [isSuccess]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setOriginalUrl(event.target?.value);
    setOnError(false);
    if (onInputChange) {
      onInputChange();
    }
  };

  const handleSubmit = (event: ChangeEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isValidUrl(originalUrl)) {
      trigger(originalUrl);
    } else {
      setOnError(true);
    }
  };

  return (
    <Paper
      component="form"
      elevation={0}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
      sx={{
        p: 0.5,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 4, // Higher border radius for pill shape
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:focus-within': {
          border: '1px solid rgba(99, 102, 241, 0.5)',
          boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
        }
      }}
    >
      <TextField
        id="outlined-basic"
        placeholder="Paste your long link here..."
        variant="standard" 
        error={onError}
        fullWidth
        required
        onChange={handleChange}
        value={originalUrl}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start" sx={{ pl: 2 }}>
              <LinkIcon sx={{ color: onError ? 'error.main' : 'text.secondary' }} />
            </InputAdornment>
          ),
          sx: { fontSize: '1.1rem', py: 1.5 }
        }}
        inputProps={{
          sx: { 
            p: 1.5,
            '&::placeholder': {
              opacity: 0.7,
            }
          }
        }}
        sx={{
          flexGrow: 1
        }}
      />
      <LoadingButton
        type="submit"
        variant="contained"
        loading={isLoading}
        loadingPosition="start"
        startIcon={<AutoFixHighIcon />}
        sx={{ 
          height: 56,
          px: 4,
          borderRadius: 3.5, // Match container
          fontSize: '1rem',
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          mr: 0.5,
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          textTransform: 'none',
          '&:hover': {
             boxShadow: '0 8px 25px rgba(236, 72, 153, 0.5)',
             background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
          }
        }}
      >
        Shorten
      </LoadingButton>

      {/* Error Signal Box */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: 0,
          right: 0,
          mx: 'auto',
          width: 'fit-content',
          opacity: onError ? 1 : 0,
          transform: onError ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <Paper
          elevation={4}
          sx={{
             background: 'rgba(239, 68, 68, 0.1)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(239, 68, 68, 0.5)',
             borderRadius: '12px',
             px: 3,
             py: 1.5,
             display: 'flex',
             alignItems: 'center',
             gap: 1.5,
             boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
             animation: onError ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none',
             '@keyframes shake': {
               '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
               '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
               '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
               '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
             }
          }}
        >
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#ef4444',
            boxShadow: '0 0 12px 2px rgba(239, 68, 68, 0.8)',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
              '70%': { boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
            }
          }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#fca5a5', 
              fontWeight: 600, 
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '0.02em',
              textShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
            }}
          >
            Oops, something went wrong. Please try again.
          </Typography>
        </Paper>
      </Box>
    </Paper>
  );
};
export default UrlForm;