import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

/**
 * Reusable pagination component
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  const handlePageChange = (newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    onPageChange(clampedPage);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box sx={{ 
      mt: 3, 
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'center', 
      gap: { xs: 0.5, sm: 1 },
      alignItems: 'center',
    }}>
      <Button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        variant="outlined"
        size="small"
      >
        First
      </Button>
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outlined"
        size="small"
      >
        Previous
      </Button>
      
      {/* Page numbers */}
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pageNum = currentPage - 2 + i;
        if (pageNum > 0 && pageNum <= totalPages) {
          return (
            <Button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              variant={pageNum === currentPage ? "contained" : "outlined"}
              size="small"
            >
              {pageNum}
            </Button>
          );
        }
        return null;
      })}
      
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outlined"
        size="small"
      >
        Next
      </Button>
      <Button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        variant="outlined"
        size="small"
      >
        Last
      </Button>
      
      {totalItems !== undefined && (
        <Typography 
          variant="body2" 
          sx={{ ml: 2, color: 'text.secondary' }}
        >
          Page {currentPage} of {totalPages}
          {totalItems > 0 && ` (${totalItems} items)`}
        </Typography>
      )}
    </Box>
  );
};

