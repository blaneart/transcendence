import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';

const axios = require('axios');

const API_UID: string = process.env.API_UID;
const API_SECRET: string = process.env.API_SECRET;

if (!API_UID)
  throw("Please set API_UID");
if (!API_SECRET)
  throw("Please set API_SECRET");

interface User42 {
  id: number; // we're going to need the 42 database id for deduplication
  login: string;
}

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

  async login(user: any) {
    console.log('USER');
    console.log(user);
    const payload = { username: user.name, sub: user.userId };
    return {
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }
}