import { Injectable, Res } from '@nestjs/common';
import { database } from 'src/signin/signin.controller';
@Injectable()
export class ProfileService {
    show(id : string, res) {
        let found = false;
        database.users.forEach(user => {
            if (user.id === id) {
                found = true;
                return res.json(user);
            }
        })
            if (!found) {
                 return res.status(404).json('no such user');
            }

    }
}
