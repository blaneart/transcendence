import { Controller, Get, Post, Body, Res, HttpStatus} from '@nestjs/common';
import { json, response } from 'express';
import { SigninService } from './signin.service';
const knex = require('knex')

async function createUsers() {
  const exists = await db.schema.hasTable('users');
  if (!exists) {
    await db.schema.createTable('users', function(t) {
      t.increments('id').primary();
      t.string('name', 100).unique();
      t.string('avatar', 100).defaultTo('TyomaRules');
      t.integer('id42').unique(); // mustn't be able to sign up twice
      t.integer('games').defaultTo(0);
      t.integer('wins').defaultTo(0);
      t.boolean('twofa').defaultTo(false);
      t.string('twofaSecret', 32);
      t.boolean('realAvatar').defaultTo(false);
      t.integer('status').defaultTo(0);
    });
  }
}

async function createAchievements() {
  const exists = await db.schema.hasTable('user_achievements');

  if (!exists) {
      await db.schema.createTable('user_achievements', function(t) {
        t.increments('id').primary();
        t.integer('user_id');
        t.integer('achievement_id');
        t.foreign('user_id').references('users.id').onDelete('CASCADE') // will be destroyed with corresponding user
        t.unique(['user_id', 'achievement_id']);
      });
    }
}

async function createGames() {
  const exists = await db.schema.hasTable('games');

  if (!exists) {
      await db.schema.createTable('games', function(t) {
        t.increments('id').primary();
        t.integer('winner');
        t.integer('loser');
        t.integer('loserScore');
      });
    }
}

async function createRoom() {
  const exists = await db.schema.hasTable('room');
    if (!exists) {
      await db.schema.createTable('room', function(t) {
        t.increments('id').primary();
        t.string('name');
        t.unique('name');
        t.integer('ownerID');
        t.boolean('restricted').defaultTo(false);
        t.string('hash');
        t.foreign('ownerID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
      });
    }
}

async function createBlockList() {
  const exists = await db.schema.hasTable('blocklist');
    if (!exists) {
      await db.schema.createTable('blocklist', function(t) {
        t.increments('id').primary();
        t.integer('blockerID');
        t.integer('blockedID');
        t.foreign('blockerID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('blockedID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.unique(['blockerID', 'blockedID']); // You can block a user only once
      });
    }
}


async function createParticipants() {
  const exists = await db.schema.hasTable('participants')
    if (!exists) {
      await db.schema.createTable('participants', function(t) {
        t.increments('id').primary();
        t.integer('userID');
        t.integer('roomID');
        t.foreign('userID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('roomID').references('room.id').onDelete('CASCADE'); // will be destroyed with corresponding room
        t.unique('userID'); // a user can only be in one room
      });
    }
}

async function createMessage() {
  const exists = await db.schema.hasTable('message')
    if (!exists) {
      await db.schema.createTable('message', function(t) {
        t.increments('id').primary();
        t.integer('userID');
        t.integer('roomID');
        t.text('message');
        t.foreign('userID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('roomID').references('room.id').onDelete('CASCADE'); // will be destroyed with corresponding room
      });
    }
}

async function createFriendList() {
  const exists = await db.schema.hasTable('friendDuos')
    if (!exists) {
      await db.schema.createTable('friendDuos', function(t) {
        t.increments('id').primary();
        t.integer('friend1');
        t.integer('friend2');
      });
    }
}

async function createBanList() {
  const exists = await db.schema.hasTable('banlist');
    if (!exists) {
      await db.schema.createTable('banlist', function(t) {
        t.increments('id').primary();
        t.integer('userID');
        t.integer('roomID');
        t.datetime('until');
        t.foreign('userID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('roomID').references('room.id').onDelete('CASCADE'); // will be destroyed with corresponding room
        t.unique(['userID', 'roomID']); // You can only ban a user once
      });
    }
}

async function createMuteList() {
  const exists = await db.schema.hasTable('mutelist');
    if (!exists) {
      await db.schema.createTable('mutelist', function(t) {
        t.increments('id').primary();
        t.integer('userID');
        t.integer('roomID');
        t.datetime('until');
        t.foreign('userID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('roomID').references('room.id').onDelete('CASCADE'); // will be destroyed with corresponding room
        t.unique(['userID', 'roomID']); // You can only ban a user once
      });
    }
}

async function createAdmins() {
  const exists = await db.schema.hasTable('admins')
    if (!exists) {
      await db.schema.createTable('admins', function(t) {
        t.increments('id').primary();
        t.integer('userID');
        t.integer('roomID');
        t.foreign('userID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('roomID').references('room.id').onDelete('CASCADE'); // will be destroyed with corresponding room
        t.unique(['userID', 'roomID']);
      });
    }
}

async function createDirects() {
  const exists = await db.schema.hasTable('directs');
    if (!exists) {
      await db.schema.createTable('directs', function(t) {
        t.increments('id').primary();;
        t.integer('userA');
        t.integer('userB');
        t.foreign('userA').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.foreign('userB').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
        t.unique(['userA', 'userB']); // two people can only have one direct conversation
      });
    }
}

async function createDirectMessages() {
  const exists = await db.schema.hasTable('directmessages');
    if (!exists) {
      await db.schema.createTable('directmessages', function(t) {
        t.increments('id').primary();;
        t.integer('directID');
        t.integer('senderID');
        t.text('message');
        t.foreign('directID').references('directs.id').onDelete('CASCADE'); // will be destroyed with corresponding direct
        t.foreign('senderID').references('users.id').onDelete('CASCADE'); // will be destroyed with corresponding user
      });
    }
}

const dbHost = process.env.DB_HOST || "127.0.0.1"
console.log(`Will be connecting to database at: ${dbHost}`)
const dbPort = process.env.DB_PORT || "8001"

export const db = knex({
    client: 'pg',
    connection: {
      host : dbHost,
      user : 'docker',
      port: dbPort,
      password : 'docker',
      database : 'docker'
    }
  });

  createUsers()
    .then(() => createRoom())
    .then(() => createAchievements())
    .then(() => createGames())
    .then(() => createParticipants())
    .then(() => createMessage())
    .then(() => createBlockList())
    .then(() => createFriendList())
    .then(() => createBanList())
    .then(() => createMuteList())
    .then(() => createAdmins())
    .then(() => createDirects())
    .then(() => createDirectMessages());


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
