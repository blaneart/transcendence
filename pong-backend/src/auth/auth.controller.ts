import { Controller, Get, Query } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

const axios = require('axios');

const API_UID: string = process.env.API_UID;
const API_SECRET: string = process.env.API_SECRET;

async function getAuthToken(authCode: string): Promise<string> {
  const response = await axios.post(`https://api.intra.42.fr/oauth/token`, {
    grant_type: 'authorization_code',
    client_id: API_UID,
    client_secret: API_SECRET,
    redirect_uri: 'https://transcendence-dev.netlify.app',
    code: authCode,
  });
  console.log(response.data);
  return response.data.access_token;
}

async function getLogin(authToken: string): Promise<string> {
  const response = await axios({
    url: 'https://api.intra.42.fr/v2/me',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data.login;
}

// Either find an existing user with a given username, or create a new one.
async function getOrCreateUser(username: string, authToken: string): Promise<any>
{
    const response = await db('users').where({name: username}).select('*');
    if (!response.length)
    {
        // Create a new user
        const new_user = await db('users').returning('*').insert({name: username, auth_token: authToken}).first();
        console.log("New user created");
        console.log(new_user);
        return new_user;
    }
    if (response.authToken !== authToken)
    {
        console.log("Auth token updated");
        // Update token to the new token
        await db('users').where({name: username}).update({auth_token: authToken});
    }
    console.log("Returning user");
    console.log(response);
    // Return old user
    return response[0];
}

@Controller('auth')
export class AuthController {
  @Get()
  async handleOauth(@Query('token') code): Promise<any> {
    if (!code) {
      return {
          status: -1,
          message: 'Return with a token, traveller',
        };
    }

    try {
      const authToken = await getAuthToken(code);
      const login = await getLogin(authToken);
      const user = await getOrCreateUser(login, authToken);
      return {
          status: 1,
          message: `Logged in as ${user.name}`
      }
    } catch (err) {
      console.log(err);
      return {
          status: -1,
          message: '42 api is drunk, come back later',
        };
    }

    // return `Hello ${token}`;
  }
}
