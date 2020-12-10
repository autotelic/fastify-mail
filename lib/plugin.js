'use strict'

function plugin (pluginOptions) {
  const defaultOptions = {
    optionDefault: 'foo',
    overloaded: 'not-seen-see-example.js'
  }

  const options = {
    ...defaultOptions,
    ...pluginOptions
  }

  function pluginHook (req, reply, next) {
    const { log } = req

    log.info(Object.entries(options))

    return next()
  }

  return pluginHook
}

module.exports = plugin
