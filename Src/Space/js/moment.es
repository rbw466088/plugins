(function(global) {
    function Bll() {
        var playVoice = (function() {
            var prePlayer = null;
            var preId = null;
            var player = document.getElementById('voicePlayer');
            player.addEventListener('ended', function() {
                prePlayer.removeClass('voice_gray_playing');
                preId = null;
            }, false);

            return function(target, event, audio, id) {
                if (!audio) {
                    openDetail(id);
                    return;
                }
                event.stopPropagation();

                if (prePlayer !== null) {
                    prePlayer.removeClass('voice_gray_playing');
                    player.pause();

                    if (preId && preId === id) {
                        preId = null;
                        return;
                    }
                }

                prePlayer = $(target).find('i');
                preId = id;
                prePlayer.addClass('voice_gray_playing');

                player.src = audio;
                player.play();
            };
        }());

        var openDetail = function(id) {
            var top = $(document.body).scrollTop();

            sessionStorage.setItem('momentTop', top);

            location.href = '/resource/' + id;
        };

        var playVideo = function(target, event) {
            event.stopPropagation();
        };

        var openLink = function(link, event) {
            event.stopPropagation();

            location.href = link;
        };

        var openImage = function(image, urls, event) {
            wx.previewImage({
                current: image,
                urls: urls
            });
            event.stopPropagation();
        };

        var test = function() {
        };

        return {
            playVoice: playVoice,
            openDetail: openDetail,
            playVideo: playVideo,
            openLink: openLink,
            test: test,
            openImage: openImage,
            lastId: 0
        };
    }

    var bll = new Bll();
    global.bll = bll;
}(window));

$(function() {
    var dropload = function(iLastId) {
        var lastId = iLastId;

        $('#moment_container').dropload({
            scrollArea: window,
            autoLoad: true,
            distance: 50,
            domDown: {
                domClass: 'dropload-down',
                domRefresh: '<div class="dropload-refresh" onclick="bll.test()"><i class="icon icon-20"></i>上拉加载更多</div>',
                domLoad: '<div class="dropload-load" onclick="bll.test()"><span class="weui-loading"></span>正在加载中...</div>',
                domNoData: '<div class="dropload-noData">没有更多数据了</div>'
            },
            loadDownFn: function(me) {
                $.ajax({
                    type: 'GET',
                    data: {last_id: lastId},
                    url: '/space/moment/get_list',
                    success: function(data) {
                        $('#moment_posts').append(data);

                        var momentData = sessionStorage.getItem('momentData') || '';
                        momentData += data;
                        sessionStorage.setItem('momentData', momentData);

                        var re = /<\!-- last_id=(\d+) -->$/i;
                        var arr = re.exec(data);

                        lastId = arr[1];
                        sessionStorage.setItem('momentLastId', lastId);
                        // 每次数据加载完，必须重置
                        me.resetload();
                    },
                    error: function() {
                        // 即使加载出错，也得重置
                        me.resetload();
                    }
                });
            }
        });
    };


    var preData = sessionStorage.getItem('momentData');
    if (preData) {
        $('#moment_posts').append(preData);

        setTimeout(function() {
            var top = sessionStorage.getItem('momentTop');
            window.scrollTo(0, top);

            var lastId = sessionStorage.getItem('momentLastId');
            dropload(lastId);
        }, 100);
    } else {
        dropload(0);
    }
});

