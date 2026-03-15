const express = require('express');
const router = express.Router();

// Check if OAuth credentials are configured
const googleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
const facebookConfigured = process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET;

// Google OAuth Routes (only if configured)
if (googleConfigured) {
  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        } else {
          // Create new user
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            password: 'google_oauth_' + Math.random().toString(36).substring(2) // Random password
          });
          await user.save();
          return done(null, user);
        }
      }
    } catch (error) {
      return done(error, null);
    }
  }));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const token = jwt.sign(
        { userId: req.user._id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }))}`);
    }
  );
} else {
  // Mock routes when not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.' 
    });
  });
}

// Facebook OAuth Routes (only if configured)
if (facebookConfigured) {
  const passport = require('passport');
  const FacebookStrategy = require('passport-facebook').Strategy;
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');

  // Facebook OAuth Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        // Check if user exists with same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            await user.save();
            return done(null, user);
          }
        }
        
        // Create new user
        user = new User({
          facebookId: profile.id,
          username: profile.displayName,
          email: profile.emails ? profile.emails[0].value : `facebook_${profile.id}@example.com`,
          password: 'facebook_oauth_' + Math.random().toString(36).substring(2) // Random password
        });
        await user.save();
        return done(null, user);
      }
    } catch (error) {
      return done(error, null);
    }
  }));

  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      const token = jwt.sign(
        { userId: req.user._id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }))}`);
    }
  );
} else {
  // Mock routes when not configured
  router.get('/facebook', (req, res) => {
    res.status(503).json({ 
      message: 'Facebook OAuth not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env file.' 
    });
  });
}

module.exports = router;
