'use strict'

const fastifyPlugin = require('fastify-plugin')
const { plugin } = require('./lib')

const DECORATOR = 'fastify-plugin-template'

module.exports = fastifyPlugin(function (fastify, options, next) {
  fastify.addHook('onRequest', plugin(options))
  next()
}, {
  name: DECORATOR
})
