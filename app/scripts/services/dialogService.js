ezCloud.service('dialogService', ['$mdDialog', '$filter', '$mdToast', 'ngNotify', function ($mdDialog, $filter, $mdToast, ngNotify) {
    this.messageBox = function (title, content, ev) {
        var translated_title = $filter("translate")(title);
        var translated_content = $filter("translate")(content);
        var translated_ok = $filter("translate")("OK");
        console.log(translated_content, translated_ok, translated_title);
        var dialog = $mdDialog.alert({
            title: translated_title,
            content: translated_content,
            ok: translated_ok

        });

        return $mdDialog.show(
            dialog
        ).finally(function () {
            dialog = undefined;
        });
    };
    this.toast = function (content, ev) {
        var translated_content = $filter("translate")(content);
        /*$mdToast.show(
            $mdToast.simple()
            .content(translated_content)
            .position('top left right')
            .hideDelay(500)
        );*/
        ngNotify.set(translated_content, {
            theme: 'pure',
            position: 'bottom',
            duration: 3000,
            type: 'success',
            sticky: false,
            button: false,
            html: false
        });
    };

    this.toastSuccess = function (content, ev) {
        var translated_content = content;//$filter("translate")(content);
        /*$mdToast.show(
            $mdToast.simple()
            .content(translated_content)
            .position('top left right')
            .hideDelay(500)
        );*/
        ngNotify.set(translated_content, {
            theme: 'pure',
            position: 'bottom',
            duration: 3000,
            type: 'success',
            sticky: false,
            button: false,
            html: false
        });
    };

    this.toastWarn = function (content, ev) {
        var translated_content = $filter("translate")(content);
        ngNotify.set(translated_content, {
            theme: 'pure',
            position: 'bottom',
            duration: 5000,
            type: 'warn',
            sticky: false,
            button: false,
            html: false
        });
    };

    this.confirm = function (title, content, ev) {
        var translated_title = $filter("translate")(title);
        var translated_content = $filter("translate")(content);
        var translated_ok = $filter("translate")("OK");
        var translated_cancel = $filter("translate")("CANCEL");
        return $mdDialog.show(
            $mdDialog.confirm()
            .title(translated_title)
            .content(translated_content)
            .ok(translated_ok)
            .cancel(translated_cancel)
            .targetEvent(ev)
        );
    };
}]);