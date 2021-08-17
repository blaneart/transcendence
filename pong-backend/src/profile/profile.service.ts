import { Injectable, Res } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

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
}
