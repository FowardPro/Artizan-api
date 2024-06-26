'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateArtworksSchema extends Schema {
  up () {
    this.create('artworks', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.integer('artist_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.integer('bought_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.enum('status', ['pending', 'approved', 'sold', 'rejected']).defaultTo('pending')
      table.integer('stage').defaultTo(0)
      table.decimal('price').notNullable()
      table.string('picture').notNullable()
      table.timestamp('bid_time').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('create_artworks');
  }
}

module.exports = CreateArtworksSchema
