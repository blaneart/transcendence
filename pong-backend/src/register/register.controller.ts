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
}
