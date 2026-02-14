# Find My Club

**Find your perfect round**

## About the Project
Find My Club is a platform designed to bridge the gap between golfers and course operators. By offering personalized recommendations, advanced search features, and community-driven data, we aim to make finding the perfect golf course simple and enjoyable for all skill levels.

## Key Features
- **Personalized Recommendations:** Tailored course suggestions based on user preferences and location.
- **Advanced Search Capabilities:** Filter courses by difficulty, amenities, location, and more.
- **Community Engagement:** Users contribute reviews and course data, enhancing the platform.
- **Easy Course Submission:** Allow course operators and enthusiasts to add new courses seamlessly.

## Why We Built This
As a passionate golfer and experienced tech professional, I wanted to create a tool that simplifies the process of finding great courses while fostering a vibrant community of golf enthusiasts. Find My Club is a labor of love that combines my expertise in technology with my love for the game.

## Tech Stack
- **Frontend:** React, deployed on Vercel with fully responsive design.
- **Backend:** Custom APIs built and deployed on Railway.
- **Database:** Supabase for real-time data and secure storage.
- **Authentication:** Email-based verification implemented via Supabase's authentication system.

## Environment Setup

### Prerequisites
- Node.js >= 18.0.0
- Python 3.x
- Supabase account
- Azure Maps account (for geocoding)
- Golf API account (golfapi.io)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in environment variables in `server/.env`:**
   - **Supabase Configuration:** Get from Supabase project dashboard → Settings → API
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)
     - `SUPABASE_PROJECT_REF`: Project reference ID
   - **Database Configuration:** Get from Supabase → Settings → Database
     - `DB_HOST`: Database host
     - `DB_PORT`: Database port (usually 5432)
     - `DB_NAME`: Database name (usually "postgres")
     - `DB_USER`: Database user
     - `DB_PASSWORD`: Database password
   - **Azure Maps API:** Get from Azure Portal → Azure Maps account → Keys
     - `AZURE_MAPS_API_KEY`: Your Azure Maps subscription key
   - **Golf API:** Get from golfapi.io dashboard
     - `GOLF_API_KEY`: Your Golf API key
   - **Application Configuration:**
     - `FRONTEND_URL`: Frontend URL (e.g., http://localhost:5173)
     - `CORS_ORIGINS`: Comma-separated list of allowed origins
     - `PORT`: Backend server port (default: 8000)

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   Or using uvicorn:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd golf-club-ui
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in environment variables in `golf-club-ui/.env.local`:**
   - **API Configuration:**
     - `VITE_API_URL`: Backend API URL (e.g., http://localhost:8000)
   - **Supabase Configuration:** Get from Supabase project dashboard → Settings → API
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Anon/public key (safe for frontend)
   - **Application URL:**
     - `VITE_APP_URL`: Frontend URL (e.g., http://localhost:5173)

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Verification

After setup, verify everything works:

1. **Backend health check:**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status": "healthy", "supabase": true}`

2. **Frontend:**
   - Open http://localhost:5173 in your browser
   - Should load without console errors
   - Authentication should work (test login/signup)

3. **Check for missing environment variables:**
   - Backend will fail fast with helpful error messages if required variables are missing
   - Frontend will show console warnings if Supabase config is missing

### Security Notes

- **Never commit `.env` or `.env.local` files** - they contain sensitive credentials
- `.env.example` files are templates and safe to commit
- Rotate any exposed credentials immediately
- Use different credentials for development and production

## How to Use
1. **Explore Courses:** Use the advanced search or recommendations to find the perfect course.
2. **Contribute:** Share reviews or add new courses to enhance the platform.
3. **Join the Community:** Sign up for early access and enjoy exclusive benefits.

## Get in Touch
Interested in collaborating or learning more? Reach out!
- **Email:** [mwatson1983@gmail.com](mailto:mwatson1983@gmail.com?subject=I'm%20interested%20in%20Find%20My%20Club)
- **LinkedIn:** [Michael Watson](https://www.linkedin.com/in/michaeljameswatson)

---

## License
This project is open-source. Contributions are welcome!
