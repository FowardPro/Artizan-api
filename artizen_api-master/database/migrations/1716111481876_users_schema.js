'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {

    this.dropIfExists('users');

    this.create('users', (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('username').notNullable()
      table.string('surname').notNullable()
      table.string('password').notNullable()
      table.string('email').notNullable().unique()
      table.string('contacts').notNullable().unique()
      table.enum('role', ['buyer', 'admin', 'artist']).defaultTo('buyer')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
