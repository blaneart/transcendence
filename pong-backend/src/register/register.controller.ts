import { Controller, Get, Post, Body, Res, HttpStatus} from '@nestjs/common';
import { db } from '../signin/signin.controller';
import { database } from '../signin/signin.controller';
@Controller('register')
export class RegisterController {
    @Post()
    create(@Body() body, @Res() res) {
        db('users').returning('*').insert({
            name: body.name,
            email: body.email,
            // password: body.password,n
            games: 0,
            image: '',
            joined: new Date()
        }).then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('unable to register'))
    }
}
