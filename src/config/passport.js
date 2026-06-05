import passport from 'passport';
import prisma from '../config/db.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        process.env.CALLBACK_URL ||
        'http://localhost:4000/auth/oauth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            nickname: profile.displayName,
            provider: 'GOOGLE',
            providerId: profile.id,
            profileImage: profile.photos[0].value,
          },
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
