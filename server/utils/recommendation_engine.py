import logging

logger = logging.getLogger(__name__)

def calculate_recommendation_score(club, user_preferences):
    """
    Calculate a recommendation score for a golf club based on user preferences.
    Returns a tuple (score, explanation).
    Score is 0-100.
    """
    try:
        score = 0
        explanation_parts = []
        weights = {
            'distance': 0.30,  # Increased importance
            'price': 0.20,
            'difficulty': 0.15,
            'amenities': 0.35   # Combined amenities + services
        }

        # Log inputs for debugging
        logger.info(f"Calculating score for club: {club.get('name') or club.get('club_name')}")
        
        # Distance score (inverse relationship)
        max_distance = 100  # miles
        distance = min(club.get('distance_miles', 100), max_distance)
        distance_score = (1 - (distance / max_distance)) * 100
        score += weights['distance'] * distance_score
        
        if distance < 10:
            explanation_parts.append("Very close to you")
        elif distance < 25:
            explanation_parts.append("Within reasonable driving distance")

        # Price match
        user_price = user_preferences.get('preferred_price_range')
        club_price = club.get('price_tier')
        if user_price and club_price:
            if user_price == club_price:
                score += weights['price'] * 100
                explanation_parts.append("Matches your price preference")
            elif len(user_price) == len(club_price) + 1 or len(user_price) == len(club_price) - 1:
                # Partial credit for adjacent tiers (e.g. $$ vs $$$)
                score += weights['price'] * 50

        # Difficulty match
        user_diff = user_preferences.get('preferred_difficulty')
        club_diff = club.get('difficulty')
        if user_diff and club_diff:
            if user_diff.lower() == club_diff.lower():
                score += weights['difficulty'] * 100
                explanation_parts.append("Matches your skill level")

        # Amenities scoring (weighted by user preference)
        # List of all tracked amenities
        amenities_list = [
            'driving_range', 'putting_green', 'chipping_green', 'practice_bunker', 
            'restaurant', 'lodging_on_site', 'motor_cart', 'pull_cart', 
            'golf_clubs_rental', 'club_fitting', 'golf_lessons'
        ]
        
        matches = 0
        preferences_count = 0
        
        for amenity in amenities_list:
            # If user explicitly wants this amenity (True in profile)
            if user_preferences.get(amenity):
                preferences_count += 1
                if club.get(amenity):
                    matches += 1
        
        if preferences_count > 0:
            amenity_score = (matches / preferences_count) * 100
            score += weights['amenities'] * amenity_score
            if matches == preferences_count:
                explanation_parts.append(f"Has all {matches} amenities you look for")
            elif matches > 0:
                explanation_parts.append(f"Has {matches} of your preferred amenities")
        else:
            # Fallback if user has no specific preferences: count total amenities
            total_amenities = sum(1 for a in amenities_list if club.get(a))
            amenity_score = (total_amenities / len(amenities_list)) * 100
            score += weights['amenities'] * amenity_score

        logger.info(f"Final score: {score}")
        
        explanation = ". ".join(explanation_parts) + "."
        return round(score, 2), explanation

    except Exception as e:
        logger.error(f"Error calculating recommendation score: {str(e)}")
        return 0, "Score calculation failed"
