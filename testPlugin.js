'use strict'
const fastifyPlugin = require('fastify-plugin')

const testPlugin = async (fastify) => {
  fastify.decorate('test-plugin', () => {
    console.log('test')
    return 'test'
  })
}

module.exports = fastifyPlugin(testPlugin)
