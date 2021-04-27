var meta = require('../package.json')

// 添加到忽略列表
fis.set('project.ignore', [
  'fis-conf.js'
])
  .set('name', meta.name)
  .set('version', meta.version)
  .set('project.fileType.text', 'es')
  // 多字符串替换
  // fis.match('*', {
  //    deploy: [
  //        fis.plugin('replace', {
  //            from: '[[cdn]]',
  //            to: 'http://www.baidu.com'
  //        }),
  //        fis.plugin('local-deliver') //must add a deliver, such as http-push, local-deliver
  //    ]
  // })

// 所有的 js
fis.match('(**.js)', {
  optimizer: fis.plugin('uglify-js'),
  release: 'Public/$1'
})

fis.match('(**.es)', {
    parser: fis.plugin('babel-5.x', {
        blacklist: ['regenerator'],
        stage: 3
    }),
    lint: fis.plugin('eslint', {
        "useEslintrc": true,
        "ignoreFiles": ["fis-conf.js", "lib/*"]
    }),
    rExt: 'js',
    release: 'Public/$1'
});

// 启用 fis-spriter-csssprites 插件
fis.match('::package', {
  spriter: fis.plugin('csssprites', {
    htmlUseSprite: true,
    layout: 'matrix'
  // styleReg: /(<style(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(<\/style\s*>|$)/ig
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

// // 所有的 css
fis.match('(**.css)', {
    optimizer: fis.plugin('clean-css'),
    useSprite: true,
    release: 'Public/$1'
})

// fis.match('*.png', {
//     optimizer: fis.plugin('png-compressor')
// })
// 所有的 png,gif
fis.match('(**.{png,gif,jpg})', {
  release: 'Public/$1'
})
// 所有的 html
fis.match('(**.html)', {
  release: 'Application/$1'
})

fis.media('publish')
  .match('(*.{es,js,less,png,gif,jpg})', {
    useHash: true // 开启 md5 戳
  })
  .match('(**.js)', {
    optimizer: fis.plugin('uglify-js'),
    domain: 'http://deploy.myline.cc',
    release: 'Assets/${name}/${version}/$1'
  })
  .match('(**.es)', {
    parser: fis.plugin('babel-5.x', {
        blacklist: ['regenerator'],
        stage: 3
    }),
    rExt: 'js',
    optimizer: fis.plugin('uglify-js'),
    domain: 'http://deploy.myline.cc',
    release: 'Assets/${name}/${version}/$1'
  })
  .match('(**.less)', {
    rExt: '.css',
    parser: fis.plugin('less'),
    optimizer: fis.plugin('clean-css'),
    useSprite: true,
    domain: 'http://deploy.myline.cc',
    release: 'Assets/${name}/${version}/$1'
  })
  .match('(**.{png,gif,jpg})', {
    domain: 'http://deploy.myline.cc',
    release: 'Assets/${name}/${version}/$1'
  })
