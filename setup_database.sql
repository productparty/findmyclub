-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. DROP EXISTING TABLES TO FIX TYPES (Clean Slate)
DROP TABLE IF EXISTS public.favorites CASCADE;
-- NOTE: We don't drop golfclub if it exists with valuable data. But if it's broken, drop it.
-- If you want to keep data, just drop favorites. But types must match.
DROP TABLE IF EXISTS public.golfclub CASCADE; 
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create Profiles Table (Fixes "could not find table public.profiles")
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    handicap_index NUMERIC,
    preferred_price_range TEXT,
    preferred_difficulty TEXT,
    skill_level TEXT,
    play_frequency TEXT,
    preferred_tees TEXT,
    number_of_holes TEXT,
    club_membership TEXT,
    driving_range BOOLEAN DEFAULT FALSE,
    putting_green BOOLEAN DEFAULT FALSE,
    chipping_green BOOLEAN DEFAULT FALSE,
    practice_bunker BOOLEAN DEFAULT FALSE,
    restaurant BOOLEAN DEFAULT FALSE,
    lodging_on_site BOOLEAN DEFAULT FALSE,
    motor_cart BOOLEAN DEFAULT FALSE,
    pull_cart BOOLEAN DEFAULT FALSE,
    golf_clubs_rental BOOLEAN DEFAULT FALSE,
    club_fitting BOOLEAN DEFAULT FALSE,
    golf_lessons BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create Golf Club Table (Required for Favorites relation)
-- Using TEXT for global_id to match external API IDs (e.g. from GolfAPI.io)
CREATE TABLE IF NOT EXISTS public.golfclub (
    global_id TEXT PRIMARY KEY,
    club_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    price_tier TEXT,
    difficulty TEXT,
    number_of_holes TEXT,
    club_membership TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    
    -- Amenities
    driving_range BOOLEAN DEFAULT FALSE,
    putting_green BOOLEAN DEFAULT FALSE,
    chipping_green BOOLEAN DEFAULT FALSE,
    practice_bunker BOOLEAN DEFAULT FALSE,
    restaurant BOOLEAN DEFAULT FALSE,
    lodging_on_site BOOLEAN DEFAULT FALSE,
    motor_cart BOOLEAN DEFAULT FALSE,
    pull_cart BOOLEAN DEFAULT FALSE,
    golf_clubs_rental BOOLEAN DEFAULT FALSE,
    club_fitting BOOLEAN DEFAULT FALSE,
    golf_lessons BOOLEAN DEFAULT FALSE,
    
    -- Geospatial
    geom GEOMETRY(POINT, 4326),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Index for Geospatial queries
CREATE INDEX IF NOT EXISTS golfclub_geom_idx ON public.golfclub USING GIST (geom);
ALTER TABLE public.golfclub ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Golf clubs are viewable by everyone." ON public.golfclub FOR SELECT USING (true);

-- 4. Create Favorites Table
-- Ensure golfclub_id matches golfclub.global_id definition (TEXT)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    golfclub_id TEXT REFERENCES public.golfclub(global_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, golfclub_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites." ON public.favorites FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can insert their own favorites." ON public.favorites FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own favorites." ON public.favorites FOR DELETE USING (auth.uid() = profile_id);

-- 5. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
