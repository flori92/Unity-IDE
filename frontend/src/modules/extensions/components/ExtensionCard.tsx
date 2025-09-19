import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  Avatar,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as VerifiedIcon,
  TrendingUp as TrendingIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import type { Extension } from '../../../types/extension';

interface ExtensionCardProps {
  extension: Extension;
  onInstall: () => void;
  onDetails: () => void;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({
  extension,
  onInstall,
  onDetails,
}) => {
  const theme = useTheme();

  const formatDownloads = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/* Banner/Icon */}
      <Box
        sx={{
          height: 120,
          background: extension.banner || `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: 48 }}>
          {extension.icon || '📦'}
        </Typography>
        
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          {extension.trending && (
            <Chip
              icon={<TrendingIcon />}
              label="Trending"
              size="small"
              color="error"
              sx={{ height: 24 }}
            />
          )}
          {extension.featured && (
            <Chip
              icon={<StarIcon />}
              label="Featured"
              size="small"
              color="warning"
              sx={{ height: 24 }}
            />
          )}
        </Box>

        {/* Update Badge */}
        {extension.hasUpdate && (
          <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
            <Chip
              icon={<UpdateIcon />}
              label="Update"
              size="small"
              color="info"
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title and Author */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" component="div" noWrap>
              {extension.displayName}
            </Typography>
            {extension.author.verified && (
              <VerifiedIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            by {extension.author.name}
          </Typography>
        </Box>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 40,
          }}
        >
          {extension.description}
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={extension.rating} precision={0.1} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              ({extension.reviews})
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DownloadIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary">
              {formatDownloads(extension.downloads)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            v{extension.version}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {extension.size}
          </Typography>
        </Box>

        {/* Categories */}
        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {extension.categories.slice(0, 3).map((category) => (
            <Chip
              key={category}
              label={category}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        {extension.installed ? (
          <>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={onDetails}
              disabled={extension.hasUpdate}
            >
              {extension.enabled ? 'Manage' : 'Enable'}
            </Button>
            {extension.hasUpdate && (
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="small"
                startIcon={<UpdateIcon />}
                onClick={onInstall}
              >
                Update
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={onInstall}
            >
              {extension.pricing === 'free' ? 'Install' : `$${extension.price}`}
            </Button>
            <IconButton size="small" onClick={onDetails}>
              <InfoIcon />
            </IconButton>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default ExtensionCard;
