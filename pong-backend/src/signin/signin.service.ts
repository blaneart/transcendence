import { Injectable } from '@nestjs/common';
import { database } from 'src/signin/signin.controller';

@Injectable()
export class SigninService {
    create(body, res) {
        if (body.email === database.users[0].email &&
            body.password === database.users[0].password) {
                return res.status(200).json(database.users[0]);
            }
    else {
        return res.status(400).json(['error loggin in']);
    }
}
}
