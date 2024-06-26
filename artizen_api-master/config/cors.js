module.exports = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: false,
  credentials: false,
  maxAge: 90,
};
