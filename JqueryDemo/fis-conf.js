fis.match('(**.es)', {
    parser: fis.plugin('babel-5.x', {
        blacklist: ['regenerator'],
        stage: 3
    }),
    lint: fis.plugin('eslint', {
        "useEslintrc": true,
        "ignoreFiles": ["fis-conf.js", "lib/*"]
    }),
    rExt: 'js'
    // release: 'Public/$1'
});

// 启用 fis-spriter-csssprites 插件
fis.match('::package', {
  spriter: fis.plugin('csssprites', {
    htmlUseSprite: true,
    layout: 'matrix'
  })
})

// // 所有的 css
fis.match('(**.less)', {
  rExt: '.css',
  parser: fis.plugin('less'),
  optimizer: fis.plugin('clean-css'),
  useSprite: true,
  release: 'Public/$1'
})