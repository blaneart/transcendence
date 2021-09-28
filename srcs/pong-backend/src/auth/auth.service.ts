import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { db } from 'src/signin/signin.controller';

const axios = require('axios');

const API_UID: string = process.env.API_UID;
const API_SECRET: string = process.env.API_SECRET;
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://127.0.0.1:3001"

if (!API_UID)
  throw("Please set API_UID");
if (!API_SECRET)
  throw("Please set API_SECRET");

interface User42 {
  id: number; // we're going to need the 42 database id for deduplication
  login: string;
}

async function getAuthToken(authCode: string): Promise<string> {
  try {
      const response = await axios.post(`https://api.intra.42.fr/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: API_UID,
      client_secret: API_SECRET,
      redirect_uri: FRONTEND_URL,
      code: authCode,
    });
    return response.data.access_token;
  }
  catch (err) {
    throw new HttpException("42 API Failed", 500);
  }
  
}

async function getLogin(authToken: string): Promise<User42> {
  try {
    const response = await axios({
      url: 'https://api.intra.42.fr/v2/me',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const ret: User42 = {
      id: response.data.id,
      login: response.data.login,
    };
    return ret;
  }
  catch (err) {
    throw new HttpException("42 API Failed", 500);
  }
  
}

@Injectable()
export class AuthService {
  constructor(
    private profileService: ProfileService,
    private jwtService: JwtService) {}

  async validate42login(code: string)
  {
      const authToken = await getAuthToken(code);
      const login42: User42 = await getLogin(authToken);
      const user = await this.profileService.getOrCreateUser(login42);
      return user;
  }

  // Return true if the user has their twofa on
  async isUserTwofa(userID: number): Promise<boolean>
  {
    const response = await db('twofa').where({user_id: userID}).select('*');
    if (!response.length)
      return false;
    return true;
  }

  // Set user's 2FA to a given secret
  async addUserTwofa(userID: number, secret: string)
  {
    if (await this.isUserTwofa(userID))
      await this.removeUserTwofa(userID);
    const response = await db('twofa').returning('*').insert({ user_id: userID, secret: secret });
    return response[0];
  }

  // Get a user's 2FA secret from the database
  async getUserTwofa(userID: number): Promise<string | null>
  {
    const response = await db('twofa').where({user_id: userID}).select('*');
    if (response.length)
      return response[0].secret;
    return null;
  }

  // Turn user's 2FA off
  async removeUserTwofa(userID: number)
  {
    const response = await db('twofa').where({user_id: userID}).delete();
    return response[0];
  }

  async login(user: any) {
    // if (user.banned)
    //   throw new HttpException("You're banned", HttpStatus.FORBIDDEN);

    if (await this.isUserTwofa(user.id))
    {
      const payload = { id: user.id }; // we're only sending id
      return {
        twofa: true,
        access_token: this.jwtService.sign(payload)
      };
    }
    else
    {
      const payload = { id: user.id };
      return {
        twofa: false,
        user: user,
        access_token: this.jwtService.sign(payload)
      };
    }
    
  }

  async loginAndTwofa(user: any) {
    const payload = {
      id: user.id,
      twofaSuccess: true,
     };
    return {
      user: user,
      access_token: this.jwtService.sign(payload)
    };
  }
}