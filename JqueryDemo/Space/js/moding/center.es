(function(global) {
    var openDetailReview = function() {
        location.href = '/Space/moding/detailReview.html';
    };

    var showConfirm = function(title, content, callBack) {
        $('#confirmTitle').text(title);
        $('#confirmContent').text(content);
        $('#confirmCancel').one('click', function() {
            // callBack && callBack();
            $('#confirmDialog').hide();
            return false;
        });

        $('#confirmOk').one('click', function() {
            callBack && callBack();
            $('#confirmDialog').hide();
            return false;
        });

        $('#confirmDialog').show();
    };
    
    /*let tmpSaveData = localStorage.getItem('tmpSave');
    if (!!tmpSaveData) {
        showConfirm('文章未保存', '您上次编辑的文章未保存，是否继续编辑？', function () {
            location.href= '/space/moding/edit'
        });
    }*/


    function Bll() {
        return {
            openDetailReview: openDetailReview
        };
    }

    var bll = new Bll();
    global.bll = bll;

    var closeDialog = function() {
        $('#edit-text-dialog').hide();
        $('#pick-resource-dialog').hide();

        event.stopPropagation();
    };

    $('#cancelButton').on('click', function(e) {
        closeDialog();
        e.stopPropagation();
        return false;
    });

    $('#okButton').on('click', function() {
        // applyEdit();
        return false;
    });
}(window));
