import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'table';
}

/**
 * Loading skeleton component for club lists
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 3, 
  variant = 'card' 
}) => {
  if (variant === 'card') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="70%" height={24} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="rectangular" 
          height={100} 
          sx={{ mb: 2, borderRadius: 1 }} 
        />
      ))}
    </Box>
  );
};

