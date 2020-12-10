'use strict'

const plugin = require('.')

module.exports = function (fastify, options, next) {
  fastify.register(plugin, { customOption: 'new', overloaded: 'see-example.js' })

  fastify.get('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ foo: 'bar' })
  })

  fastify.post('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'world' })
  })

  next()
}
