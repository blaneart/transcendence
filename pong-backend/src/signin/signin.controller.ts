import { Controller, Get, Post, Body, Res, HttpStatus} from '@nestjs/common';
import { json, response } from 'express';
import { SigninService } from './signin.service';
const knex = require('knex')

export const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'docker',
      port: '8001',
      password : 'docker',
      database : 'docker'
    }
  });
  db.schema.hasTable('users2').then(function(exists) {
    if (!exists) {
      return db.schema.createTable('users2', function(t) {
        t.increments('id').primary();
        t.string('first_name', 100);
        t.string('last_name', 100);
        t.text('bio');
      });
    }
  });
// db.select('*').from('users').then(data => {
    // console.log(data)
// });
export const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            games: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}
@Controller('signin')
export class SigninController {
    constructor( private readonly signinService: SigninService)
    {

    }
    @Get()
    just()
    {
        return database;
    }

    @Post()
    create(@Body() body, @Res() res) {
        return this.signinService.create(body, res);
    }
}
