import passport from 'passport';
import prisma from '../config/db.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${
        process.env.SERVER_URL || 'http://localhost:4000'
      }/auth/oauth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('Google email not provided'));
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            nickname: profile.displayName,
            providerType: 'GOOGLE',
            providerId: profile.id,
            profileImageUrl: profile.photos?.[0]?.value,
            point: { create: { balance: 0 } },
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
