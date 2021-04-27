(function(global) {
    var maskCreate = $('#maskCreate');
    var createAS = $('#createAS');

    var maskWhiteNoise = $('#maskWhiteNoise');
    var whiteNoiseAS = $('#whiteNoiseAS');

    var showConfirm = function(title, content, callBack) {
        $('#confirmTitle').text(title);
        $('#confirmContent').text(content);
        $('#confirmCancel').one('click', function() {
            callBack && callBack({DialogResult: false});
            $('#confirmDialog').hide();
            return false;
        });

        $('#confirmOk').one('click', function() {
            callBack && callBack({DialogResult: true});
            $('#confirmDialog').hide();
            return false;
        });

        $('#confirmDialog').show();
    };

    var ua = window.navigator.userAgent.toLowerCase();
    var isWeixin = ua.match(/MicroMessenger/i) == 'micromessenger';// eslint-disable-line

    var hideActionSheet = function(actionsheet, mask) {
        actionsheet.removeClass('weui_actionsheet_toggle');
        mask.removeClass('weui_fade_toggle');
        mask.on('transitionend', function() {
            mask.hide();
        }).on('webkitTransitionEnd', function() {
            mask.hide();
        });
    };

    var showActionSheet = function(actionsheet, mask) {
        actionsheet.addClass('weui_actionsheet_toggle');
        mask.show()
            .focus()
            .addClass('weui_fade_toggle')
            .one('click', function() {
                hideActionSheet(actionsheet, mask);
            });
        mask.unbind('transitionend').unbind('webkitTransitionEnd');
    };

    var showCreateAS = function() {
        showActionSheet(createAS, maskCreate);
    };

    var showWhiteNoiseAS = function() {
        if (isWeixin) {
            wx.getNetworkType({
                success: function(res) {
                    var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
                    if (networkType === 'wifi') {
                        showActionSheet(whiteNoiseAS, maskWhiteNoise);
                    } else {
                        showConfirm('友情提示',
                            '你当前未使用WIFI，启用白噪音会耗费你的流量，是否启用？',
                                    function(ret) {
                                        if (ret.DialogResult) {
                                            showActionSheet(whiteNoiseAS, maskWhiteNoise);
                                        }
                                    });
                    }
                }
            });
        } else {
            showActionSheet(whiteNoiseAS, maskWhiteNoise);
        }
    };

    var toast = function(message) {
        if (message && message.length > 0) {
            $('#toast-content').text(message);
        }
        $('#toast').show();
        setTimeout(function() {
            $('#toast').hide();
        }, 1000);
    };

    var getEditData = function() {
        var data = null;
        var list = [];
        $('.article-item').each(function() {
            var item = {};
            item.type = $(this).attr('data-type');
            item.text = $(this).find('.edit-text').attr('data-value');
            item.localId = $(this).find('.edit-image').attr('src');
            item.serverId = $(this).find('.edit-image').attr('data-server-id');

            list.push(item);
        });

        var id = $('#draft-id').val();

        data = {
            id: id,
            title: $('#article-title').attr('data-value'),
            list: list
        };

        return data;
    };

    var loadEditData = function(content) {
        $('#article-title').attr('data-value', content.title);
        $('#article-title').text(content.title);

        var html = template('article-item', content); // eslint-disable-line
        $('#article-items').append(html);
    };

    var saveDraft = function() {
        $.ajax({
            type: 'post',
            url: '/space/moding/save_draft',
            data: getEditData(),
            dataType: 'json',
            success: function(ret) {
                if (ret.status === 'y') {
                    $('#draft-id').val(ret.info);
                    localStorage.removeItem('tmpSave');

                    toast('已保存草稿');
                }
            }
        });
    };

    var tmpSave = (function() {
        var preIntervalId = null;

        return function() {
            clearInterval(preIntervalId);

            preIntervalId = setInterval(function() {
                saveDraft();

                clearInterval(preIntervalId);
            }, 30000);

            setTimeout(function() {
                var data = getEditData();
                localStorage.setItem('tmpSave', JSON.stringify(data));
            }, 10000);
        };
    })();

    var addItem = function(target) {
        undocancel();

        var data = {
            list: [
                {
                    type: $.trim($(target).text())
                }
            ]
        };
        var html = template('article-item', data); // eslint-disable-line
        $('#article-items').append(html);
        hideActionSheet(createAS, maskCreate);

        tmpSave();
    };

    var deleteItem = function(target) {
        preDeleteTarget = $(target).closest('.article-item');
        preDeleteTarget.hide();
        $('#tooltips').show();

        tmpSave();
    };

    var upItem = function(target) {
        undocancel();

        var item = $(target).closest('.article-item');
        var prev = item.prev();
        item.insertBefore(prev);


        tmpSave();
    };

    var downItem = function(target) {
        undocancel();

        var item = $(target).closest('.article-item');
        var next = item.next();
        item.insertAfter(next);

        tmpSave();
    };

    var uploadImage = function(localIds) {
        var idList = localIds;

        var upload = function(idx) {
            if (idx < idList.length) {
                var localId = idList[idx];
                wx.uploadImage({
                    localId: localId,
                    isShowProgressTips: 0,
                    success: function(res) {
                        var serverId = res.serverId; // 返回图片的服务器端ID

                        var id = localId.replace('wxLocalResource://', '');
                        $('#id-' + id).attr('data-server-id', serverId);

                        var nextId = idx + 1;
                        if (nextId < idList.length) {
                            upload(nextId);
                        }
                    }
                });
            } else {
                tmpSave();
            }
        };

        upload(0);
    };

    var chooseImage = function() {
        hideActionSheet(createAS, maskCreate);
        wx.chooseImage({
            sizeType: ['compressed'],
            success: function(res) {
                var localIds = res.localIds;
                if (localIds.length === 0) {
                    return;
                }

                var list = [];

                for (var i = 0; i < localIds.length; i++) {
                    list.push({
                        type: '图片',
                        localId: localIds[i]
                    });
                }
                var data = {
                    list: list
                };
                var html = template('article-item', data); // eslint-disable-line
                $('#article-items').append(html);
                uploadImage(localIds);
            }
        });
    };

    var showPick = function() {
        $('#pick-resource-dialog').show();

        $.ajax({
            type: 'get',
            url: '/space/moding/get_resource_list',
            success: function(data) {
                $('#thumbnails').html(data);
            }
        });

        hideActionSheet(createAS, maskCreate);
    };

    var pickResource = function(target) {
        $(target).find('.thumbnail').toggleClass('selected');

        var title = $.trim($(target).text());
        var coverStr = $(target).find('.resource-image').css('background-image');
        var cover = coverStr.slice(5, -2);
        var data = {
            list: [
                {
                    type: '空间素材',
                    title: title,
                    img: cover
                }
            ]
        };
        var html = template('article-item', data); // eslint-disable-line
        $('#article-items').append(html);
        hideActionSheet(createAS, maskCreate);

        tmpSave();
    };

    var applyPick = function() {
        $('#pick-resource-dialog').hide();
    };

    var preEditTarget = null;
    var preDeleteTarget = null;

    var closeDialog = function() {
        $('#edit-text-dialog').hide();
        $('#pick-resource-dialog').hide();

        event.stopPropagation();
    };

    var applyEdit = function() {
        $('#edit-text-dialog').hide();
        var text = $('#edit-text-textarea').val();
        if (text.length > 0) {
            $(preEditTarget).attr('data-placeholder', $(preEditTarget).text());
            $(preEditTarget).text(text);
            $(preEditTarget).attr('data-value', text);
        } else {
            var val = $(preEditTarget).attr('data-value');
            if (val && val.length > 0) {
                $(preEditTarget).text($(preEditTarget).attr('data-placeholder'));
                $(preEditTarget).attr('data-value', '');
            }
        }

        tmpSave();
        event.stopPropagation();
    };

    var showEditDialog = function(target) {
        preEditTarget = target;
        var text = $(preEditTarget).text();
        var val = $(preEditTarget).attr('data-value');
        if (val && val.length > 0) {
            $('#edit-text-textarea').val(text);
            $('#edit-text-textarea').text($(preEditTarget).attr('data-placeholder'));

            var input = $('#edit-text-textarea');
            var selectionStart = 0;
            var selectionEnd = text.length;

            if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            } else if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            }

            $('#text-length').text(text.length);
        } else {
            $('#edit-text-textarea').val('');
            $('#edit-text-textarea').attr('placeholder', text);
        }
        $('#edit-text-dialog').show();
        $('#edit-text-textarea').focus();

        event.stopPropagation();
    };

    var textChange = function(value) {
        var newValue = value;
        if (value.length > 500) {
            newValue = value.substr(0, 500);
            $('#edit-text-textarea').val(newValue);
        }

        $('#text-length').text(newValue.length);
    };

    var playWhiteNoise = function(fileName) {
        var url = 'http://media.my2space.com/nanqi/WhiteNoise/' + fileName;
        var player = document.getElementById('whiteNoisePlayer');
        player.src = url;
        player.play();
    };

    var stopWhiteNoise = function() {
        var player = document.getElementById('whiteNoisePlayer');
        player.pause();
    };

    var preview = function() {
        $('#previewTabbar').toggleClass('on-preview');

        var flg = $('#previewTabbar').hasClass('on-preview');
        $('#previewText').text(flg ? '预览中' : '预览');

        if (flg) {
            $('#article-items').hide();
            $('#createBtn').hide();

            var html = '';

            $('.article-item').each(function() {
                var type = $(this).attr('data-type');
                var text = $(this).find('.edit-text').attr('data-value');
                var localId = $(this).find('.edit-image').attr('src');

                switch (type) {
                case '文本':
                    html += '<p>';
                    html += text;
                    html += '</p>';
                    break;
                case '图片':
                    html += '<figure>';
                    html += '<img src="' + localId + '">';
                    html += '<figcaption>';
                    html += text;
                    html += '</figcaption>';
                    html += '</figure>';
                    break;
                case '标题':
                    html += '<h2>';
                    html += text;
                    html += '</h2>';
                    break;
                case '引用':
                    html += '<blockquote>';
                    html += text;
                    html += '</blockquote>';
                    break;
                case '分割线':
                    html += '<hr />';
                    break;
                case '空间素材':
                    break;
                default:
                    break;
                }
            });


            $('#article-preview').html(html);

            $('#article-preview').show();
        } else {
            $('#article-preview').hide();
            $('#article-items').show();
            $('#createBtn').show();
        }
    };

    var publish = function() {
        $.ajax({
            type: 'post',
            url: '/space/moding/publish',
            data: getEditData(),
            dataType: 'json',
            success: function(ret) {
                if (ret.status === 'y') {
                    localStorage.removeItem('tmpSave');

                    toast('发布成功');

                    setTimeout(function() {
                        location.href = '/resource/' + ret.info;
                    }, 2000);
                } else {
                    toast(ret.info);
                }
            }
        });
    };

    var undoconfirm = function() {
        preDeleteTarget.show();
        $('#tooltips').hide();
    };

    var undocancel = function() {
        preDeleteTarget && preDeleteTarget.remove();
        $('#tooltips').hide();
    };

    var test = function(target) {
        var url = $(target).attr('src');
        wx.previewImage({
            current: url,
            urls: [url]
        });
    };

    function Bll() {
        return {
            addItem: addItem,
            deleteItem: deleteItem,
            upItem: upItem,
            downItem: downItem,

            chooseImage: chooseImage,

            showPick: showPick,
            pickResource: pickResource,
            applyPick: applyPick,

            showCreateAS: showCreateAS,
            showWhiteNoiseAS: showWhiteNoiseAS,

            closeDialog: closeDialog,
            applyEdit: applyEdit,
            showEditDialog: showEditDialog,

            textChange: textChange,
            saveDraft: saveDraft,

            playWhiteNoise: playWhiteNoise,
            stopWhiteNoise: stopWhiteNoise,

            preview: preview,
            publish: publish,

            undoconfirm: undoconfirm,
            undocancel: undocancel,

            test: test
        };
    }

    var bll = new Bll();
    global.bll = bll;

    /*eslint-disable */
    editContent && loadEditData(editContent);
    /*eslint-enable */

    let tmpSaveData = localStorage.getItem('tmpSave');
    if (!!tmpSaveData) {
        let tmpSaveObj = JSON.parse(tmpSaveData);
        loadEditData(tmpSaveObj);
    }

    $('#cancelCreateAS').click(function() {
        hideActionSheet(createAS, maskCreate);
    });

    $('#cancelWhiteNoiseAS').click(function() {
        hideActionSheet(whiteNoiseAS, maskWhiteNoise);
    });

    $('#cancelButton').on('click', function(e) {
        closeDialog();
        e.stopPropagation();
        return false;
    });

    $('#okButton').on('click', function() {
        applyEdit();
        return false;
    });
}(window));
