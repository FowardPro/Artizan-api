'use strict'

const Env = use('Env')

module.exports = {
  connection: Env.get('MAIL_CONNECTION', 'smtp'),

  smtp: {
    driver: 'smtp',
    pool: true,
    port: Env.get('MAIL_PORT', 2525),
    host: Env.get('MAIL_HOST', 'sandbox.smtp.mailtrap.io'),
    secure: false,
    auth: {
      user: Env.get('MAIL_USERNAME', '6356ec47c87e1e'),
      pass: Env.get('MAIL_PASSWORD', '868b45f786d9a9'),
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  from: {
    address: Env.get('MAIL_FROM_ADDRESS', 'artizen@gmail.com'),
    name: Env.get('MAIL_FROM_NAME', 'Artizen App'),
  },
}
