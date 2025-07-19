// authRouter.ts
import express, { Router, Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import cors from "cors";
import dotenv from "dotenv";
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { JWT_SECRET, GOOGLE_CLIENT_ID, SUPABASE_URL, SUPABASE_KEY } from '../settings';
import { corsOptions, JWT_CONFIG, ERROR_MESSAGES, HTTP_STATUS, TOKEN_REFRESH_THRESHOLD } from '../constants';

dotenv.config();

// Validate all required environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase configuration');
}
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET configuration');
}
if (!GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const router: Router = express.Router();
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.use(cors(corsOptions));
router.use(express.json());

interface UserData {
  id: number;
  email: string;
  name: string;
  picture: string;
  googleId: string;
}

const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt started');
    console.log('Request body:', req.body);

    const { token } = req.body;
    if (!token) {
      console.log('No token provided in request');
      res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.NO_TOKEN_PROVIDED,
        details: 'Token is required in request body'
      });
      return;
    }

    try {
      console.log('Verifying Google token...');
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      }).catch(error => {
        console.error('Google token verification failed:', error);
        throw new Error(`${ERROR_MESSAGES.INVALID_GOOGLE_TOKEN}: ${error.message}`);
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        console.error('Invalid payload from Google token:', payload);
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
          message: ERROR_MESSAGES.INVALID_GOOGLE_TOKEN,
          details: 'Token payload is missing required fields'
        });
        return;
      }

      const { email, name, picture, sub } = payload;
      console.log('Google token verified for email:', email);

      // Check for existing user in Supabase
      console.log('Checking for existing user...');
      const { data: existingUser, error: selectError } = await supabase
        .from('userLogin')
        .select('*')
        .eq('email', email)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Database select error:', selectError);
        throw new Error(`Database error during user lookup: ${selectError.message}`);
      }

      let user: UserData;

      if (existingUser) {
        console.log('Updating existing user...');
        const { data: updatedUser, error: updateError } = await supabase
          .from('userLogin')
          .update({
            name: name || existingUser.name,
            picture: picture || existingUser.picture,
            googleId: sub || existingUser.googleId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`${ERROR_MESSAGES.USER_UPDATE_FAILED}: ${updateError.message}`);
        }
        if (!updatedUser) {
          throw new Error(`${ERROR_MESSAGES.USER_UPDATE_FAILED}: No user returned after update`);
        }
        user = { ...updatedUser, id: Number(updatedUser.id) } as UserData;
        console.log('User updated successfully');
      } else {
        console.log('Creating new user...');
        const { data: newUser, error: insertError } = await supabase
          .from('userLogin')
          .insert({
            email,
            name: name || '',
            picture: picture || '',
            googleId: sub || ''
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error(`${ERROR_MESSAGES.USER_CREATION_FAILED}: ${insertError.message}`);
        }
        if (!newUser) {
          throw new Error(`${ERROR_MESSAGES.USER_CREATION_FAILED}: No user returned after insert`);
        }
        user = { ...newUser, id: Number(newUser.id) } as UserData;
        console.log('New user created successfully');
      }

      console.log('Generating JWT token...');
      const accessToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET as string,
        JWT_CONFIG as SignOptions
      );

      console.log('Login successful, sending response');
      res.status(HTTP_STATUS.OK).json({ 
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (innerError) {
      console.error('Inner error during login process:', innerError);
      throw innerError;
    }

  } catch (error) {
    console.error('Login error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.LOGIN_FAILED,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const verifyHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.NO_TOKEN_PROVIDED });
      return;
    }

    if (!JWT_SECRET) {
      throw new Error('Missing JWT_SECRET environment variable');
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const { data: user, error } = await supabase
      .from('userLogin')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    let newToken: string | undefined;

    if (decoded.exp && decoded.exp - now < TOKEN_REFRESH_THRESHOLD) {
      newToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        JWT_CONFIG as SignOptions
      );
    }

    res.status(HTTP_STATUS.OK).json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      ...(newToken ? { newToken } : {})
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: ERROR_MESSAGES.INVALID_TOKEN,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.post("/api/auth/google-login", (req: Request, res: Response, next: NextFunction) => {
  loginHandler(req, res).catch(next);
});

router.get("/api/auth/verify", (req: Request, res: Response, next: NextFunction) => {
  verifyHandler(req, res).catch(next);
});

export default router;