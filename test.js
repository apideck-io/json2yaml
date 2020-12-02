const jsonYaml = require('./index')
const json = require('./example.json')

const run = () => {
  const obj = {
    '200': 'test',
    'test': {
      'nested': 'value'
    }
  }
  console.log(jsonYaml.stringify(obj))
}

run()