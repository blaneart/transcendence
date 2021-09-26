import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class SigninService {
    create(body, res) {
        db.select('name').from('users')
        .where('name', '=', body.name)
        .then(user => {
            return db.select('*').from('users')
            .where('name', '=', body.name)
            .then(user => {
                res.json(user[0])
            })
        })
    
    }
}

