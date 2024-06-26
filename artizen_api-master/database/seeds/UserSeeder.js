'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const User = use('App/Models/User');

class UserSeeder {
  async run () {
    await User.create({
      name: 'Tshwane',
      surname: 'Seshego',
      username: 'tshwane',
      contacts: '0112321234',
      email: 'admin@artisan.com',
      role: 'admin',
      password: '123456789'
    });
  }
}

module.exports = UserSeeder;
