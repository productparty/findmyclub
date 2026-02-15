import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClubCard from '../components/ClubCard';
import { Club } from '../types/Club';
import '@testing-library/jest-dom';

// Mock club data
const mockClub: Club = {
    id: '1',
    global_id: 'club_1',
    club_name: 'Test Golf Club',
    address: '123 Fairway Ln',
    city: 'Golfville',
    state: 'GA',
    zip_code: '30000',
    latitude: 33.1,
    longitude: -84.1,

    phone: '555-1234',
    email: 'test@testgolf.com',
    social_media: {},
    amenities: [],
    score: 95,
    reviews: [],
    price_tier: '$$$',
    difficulty: 'Moderate',
    number_of_holes: 18,
    year_built: 1990,
    architect: 'Test Architect',
    guest_policy: 'Open',
    driving_range: true,
    putting_green: true,
    chipping_area: true,
    practice_bunker: true,
    motor_cart: true,
    pull_cart: true,
    golf_clubs_rental: true,
    club_fitting: false,
    pro_shop: true,
    golf_lessons: true,
    caddie_services: false,
    restaurant: true,
    reception_hall: false,
    changing_room: true,
    lockers: true,
    lodging_on_site: false
};

describe('ClubCard', () => {
    it('renders club name and location', () => {
        // We mock the navigation/router if needed, but ClubCard might just need simple props
        // Check if ClubCard uses useNavigate or Link. If so, we need MemoryRouter.
        // Based on previous view, ClubCard takes onClick.

        render(
            <ClubCard
                club={mockClub}
                index={0}
                onClick={() => { }}
                isFavorite={false}
                onToggleFavorite={() => { }}
            />
        );

        expect(screen.getByText('Test Golf Club')).toBeInTheDocument();
        expect(screen.getByText('Golfville, GA')).toBeInTheDocument();
    });
});
