import { z } from 'zod';

// Zod schema for Golfer Profile
export const GolferProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  handicap_index: z.number().nullable().optional(),
  preferred_price_range: z.string().nullable().optional(),
  preferred_difficulty: z.string().nullable().optional(),
  skill_level: z.string().nullable().optional(),
  play_frequency: z.string().nullable().optional(),
  preferred_tees: z.string().nullable().optional(),
  number_of_holes: z.string().nullable().optional(),
  club_membership: z.string().nullable().optional(),
  driving_range: z.boolean().nullable().optional(),
  putting_green: z.boolean().nullable().optional(),
  chipping_green: z.boolean().nullable().optional(),
  practice_bunker: z.boolean().nullable().optional(),
  restaurant: z.boolean().nullable().optional(),
  lodging_on_site: z.boolean().nullable().optional(),
  motor_cart: z.boolean().nullable().optional(),
  pull_cart: z.boolean().nullable().optional(),
  golf_clubs_rental: z.boolean().nullable().optional(),
  club_fitting: z.boolean().nullable().optional(),
  golf_lessons: z.boolean().nullable().optional(),
});

export type GolferProfile = z.infer<typeof GolferProfileSchema>;

