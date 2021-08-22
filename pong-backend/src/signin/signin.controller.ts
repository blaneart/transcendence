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

  db.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return db.schema.createTable('users', function(t) {
        t.increments('id').primary();
        t.string('name', 100).unique();
        t.string('avatar', 100);
        t.integer('id42').unique(); // mustn't be able to sign up twice
        t.integer('games');
        t.integer('wins');
      });
    }
  });
// db.select('*').from('users').then(data => {
    // console.log(data)
// });

@Controller('signin')
export class SigninController {
    constructor( private readonly signinService: SigninService)
    {

    }
    @Get()
    just()
    {
        return db;
    }

    @Post()
    create(@Body() body, @Res() res) {
        return this.signinService.create(body, res);
    }
}
