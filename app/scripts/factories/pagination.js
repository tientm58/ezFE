ezCloud.factory('PaginationFactory', ['$filter', function ($filter) {
    var pagination = {};
    pagination.getNew = function (perPage) {

        perPage = perPage === undefined ? 5 : perPage;

        var paginator = {
            numPages: 1,
            perPage: perPage,
            page: 1,
            totalItems: 0
        };

        paginator.prevPage = function () {
            if (paginator.page > 1) {
                paginator.page -= 1;
            }
        };

        paginator.nextPage = function () {
            if (paginator.page <= paginator.numPages - 1) {
                paginator.page += 1;
            }
        };

        paginator.firstPage = function () {
            if (paginator.page > 0) {
                paginator.page = 1;
            }
        };
        paginator.lastPage = function () {
            if (paginator.page > 0) {
                paginator.page = paginator.numPages;
            }
        };

        paginator.toPage = function (page) {
            if (page >= 0 && id <= paginator.numPages - 1) {
                paginator.page = page;
            }
        };
        paginator.chanePerPage = function (perPage) {
            paginator.page = 1;
            paginator.CountPage(null);
        };
        paginator.getNumberRecordString = function () {
            var result = $filter("translate")("SHOWING") + " ";
            if (paginator) {
                // 1-10 trong các số 15 bản ghi
                if (paginator.page == 1) {
                    if (paginator.totalItems > 0)
                        result += " 1-";
                    else result += " 0-";
                } else if (paginator.page > 1) {
                    result += ((paginator.page - 1) * paginator.perPage) + 1 + "-";
                }
                //
                if ((paginator.page * paginator.perPage) >= paginator.totalItems) {
                    result += paginator.totalItems;
                } else {
                    result += (paginator.page * paginator.perPage);
                }
                result += " " + $filter("translate")("OF") + " " + paginator.totalItems + " " + $filter("translate")("ENTRIES");
            }
            return result;
        };
        paginator.CountPage = function (totalItems) {
            if (paginator.perPage) {
                paginator.numPages = Math.ceil(totalItems / paginator.perPage);
                paginator.totalItems = totalItems;
            }
            //
            // if (!totalItems && paginator.totalItems) {
            //     paginator.numPages = Math.ceil(paginator.totalItems / paginator.perPage);
            // }
        }
        return paginator;
    };

    return pagination;
}]);