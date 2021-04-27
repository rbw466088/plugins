" Configuration file for vim
set modelines=0		" CVE-2007-2438

" Normally we use vim-extensions. If you want true vi-compatibility
" remove change the following statements
set nocompatible	" Use Vim defaults instead of 100% vi compatibility
set backspace=2		" more powerful backspacing

" Don't write backup file if vim is being called by "crontab -e"
au BufWrite /private/tmp/crontab.* set nowritebackup nobackup
" Don't write backup file if vim is being called by "chpass"
au BufWrite /private/etc/pw.* set nowritebackup nobackup


syntax enable
syn on 					" 语法支持
set laststatus=2 		" 始终显示状态栏
set tabstop=2 			" 一个制表符的长度
set softtabstop=2 		" 一个制表符的长度（可以大于tabstop）
set shiftwidth=2 		" 一个缩进的长度
set expandtab 			" 使用空格替代制表符
set smarttab 			" 智能制表符
set autoindent 			" 自动缩进
set smartindent 		" 只能缩进
set number 				" 显示行号
set ruler 				" 显示位置指示器
"set backupdir=/tmp 		" 设置备份文件目录
"set directory=/tmp 		" 设置临时文件目录
set ignorecase 			" 检索时忽略大小写
set hls 				" 检索时高亮显示匹配项
set helplang=cn 		" 帮助系统设置为中文
set foldmethod=syntax 	" 代码折叠
