import { Injectable, Res } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
   return result;
  }

// Information that we get from 42
interface User42 {
  id: number; // we're going to need the 42 database id for deduplication
  login: string;
}

@Injectable()
export class ProfileService {
    show(id : string, res) {
        let found = false;
        db.users.forEach(user => {
            if (user.id === id) {
                found = true;
                return res.json(user);
            }
        })
            if (!found) {
                 return res.status(404).json('no such user');
            }
    }

// Either find an existing user from a given User42, or create a new one.
async getOrCreateUser(user: User42): Promise<any> {
  const response = await db('users').where({ id42: user.id }).select('*');
  if (!response.length) {
    // Create a new user
    const new_user = await db('users')
      .returning('*')
      .insert({ name: user.login, id42: user.id, avatar: makeid(10) });
    return new_user[0];
  }
  // Return old user
  return response[0];
}

async updateUserById(id: number, change: any)
{
  const response = await db('users').returning('*').where({id: id}).update(change);
  return response[0];
}


}
