import { Controller, Get, Post, Body, Res, HttpStatus} from '@nestjs/common';
import { db } from '../signin/signin.controller';

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

  
@Controller('register')
export class RegisterController {
    @Post()
    create(@Body() body, @Res() res) {
        db('users').returning('*').insert({
            name: body.name,
            avatar: makeid(10),
            // password: body.password,n
            games: 0,
            wins: 0,
        }).then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('unable to register'))
    }
}
