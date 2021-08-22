import { Controller, Get, Query, Req, Session } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';
import { Request } from 'express';

const axios = require('axios');

// Add visits to session object
declare module 'express-session' {
  interface SessionData {
    user_id: number;
  }
}

const API_UID: string = process.env.API_UID;
const API_SECRET: string = process.env.API_SECRET;

// Exchange auth code for 42 api access code
async function getAuthToken(authCode: string): Promise<string> {
  const response = await axios.post(`https://api.intra.42.fr/oauth/token`, {
    grant_type: 'authorization_code',
    client_id: API_UID,
    client_secret: API_SECRET,
    redirect_uri: 'http://127.0.0.1:3001',
    code: authCode,
  });
  return response.data.access_token;
}

interface User42 {
  id: number; // we're going to need the 42 database id for deduplication
  login: string;
}

// Ask 42's api's for our login and user id
async function getLogin(authToken: string): Promise<User42> {
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

// Either find an existing user with a given username, or create a new one.
async function getOrCreateUser(user: User42, authToken: string): Promise<any> {
  const response = await db('users').where({ id42: user.id }).select('*');
  if (!response.length) {
    // Create a new user
    const new_user = await db('users')
      .returning('*')
      .insert({ name: user.login, id42: user.id });
    return new_user[0];
  }
  // Return old user
  return response[0];
}

@Controller('auth')
export class AuthController {
  @Get('/whoami')
  whoami(@Session() session: Record<string, any>,) { // TODO remove
    return `User id: ${session.user_id}`;
  }

  @Get('/signUp')
  async handleOauth(
    @Session() session: Record<string, any>,
    @Query('code') code,
  ): Promise<any> {
    if (!code) {
      return {
        status: -1,
        message: 'Return with a token, traveller',
      };
    }

    try {
      const authToken = await getAuthToken(code);
      const login: User42 = await getLogin(authToken);
      const user = await getOrCreateUser(login, authToken);
      session.user_id = user.id; // here, ID is OUR id, not 42's
      return {
        status: 1,
        user: {
          id: user.id, // here, ID is OUR id, not 42's
          name: user.name,
          avatar: user.avatar,
          games: user.games,
          wins: user.wins,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        status: -1,
        message: '42 api is drunk, come back later',
      };
    }
  }
}
