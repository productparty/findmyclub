import React, { useState } from 'react';
import { Box, Typography, Paper, Rating, TextField, Button, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { config } from '../config'; // Assuming config exists with API_URL
import { useAuth } from '../context/AuthContext';

interface Review {
    id: string;
    club_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    first_name?: string;
    last_name?: string;
}

interface ReviewSectionProps {
    clubId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ clubId }) => {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch reviews
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews', clubId],
        queryFn: async () => {
            const response = await fetch(`${config.API_URL}/api/clubs/${clubId}/reviews`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            return response.json() as Promise<Review[]>;
        }
    });

    // Submit review mutation
    const mutation = useMutation({
        mutationFn: async (newReview: { rating: number, comment: string }) => {
            if (!session?.access_token) throw new Error('Must be logged in');
            const response = await fetch(`${config.API_URL}/api/clubs/${clubId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ ...newReview, club_id: clubId })
            });
            if (!response.ok) throw new Error('Failed to submit review');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', clubId] });
            setRating(0);
            setComment('');
            setError(null);
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleSubmit = () => {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            // Basic validation
            if (!rating) {
                setError("Please provide a rating");
                return;
            }
        }
        mutation.mutate({ rating: rating || 0, comment });
    };

    if (isLoading) return <Typography>Loading reviews...</Typography>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Reviews</Typography>

            {/* Add Review Form */}
            {session ? (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Write a Review</Typography>
                    <Rating
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !rating}
                        sx={{ mt: 1 }}
                    >
                        Submit
                    </Button>
                </Paper>
            ) : (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography>Please log in to leave a review.</Typography>
                </Paper>
            )}

            {/* Reviews List */}
            <List>
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <React.Fragment key={review.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar>{review.first_name?.[0] || 'U'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle1">
                                                {review.first_name} {review.last_name || ''}
                                            </Typography>
                                            <Rating value={review.rating} readOnly size="small" />
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </Typography>
                                            {" — " + review.comment}
                                        </>
                                    }
                                />
                            </ListItem>
                            {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))
                ) : (
                    <Typography color="text.secondary">No reviews yet.</Typography>
                )}
            </List>
        </Box>
    );
};

export default ReviewSection;
