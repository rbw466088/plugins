module.exports = {
  root: true,
  // https://github.com/sivan/javascript-style-guide/tree/master/es5
  extends: 'airbnb-es5',
  'globals': {
    '$': true,
    'wx': true
  },
  'rules': {
    'indent': [2, 4],
    'func-names': 0,
    'no-console': [1, { allow: ['warn', 'error'] }]
  }
}
