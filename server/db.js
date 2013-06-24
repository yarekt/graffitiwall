var mysql = require('mysql');
var connection = mysql.createConnection({
    user: 'graffitiwall',
    database: 'graffitiwall_websocket'
});

var _getCountFrom = function(table, namespace, callback) {
    namespace = namespace || '';
    connection.query('SELECT count(*) as count FROM ' + table + ' WHERE namespace = ?', [namespace] function(err, result) {
        callback(result[0].count);
    });
};

exports.insert = function(data) {
    connection.query('INSERT INTO points SET ?', data);
};

exports.replay = function(callback, namespace) {
    namespace = namespace || '';
    _getCountFrom('points', namespace, function(total){
        var query = connection.query(
            'SELECT x1, y1, x2, y2, width, color FROM points WHERE namespace = ? ORDER BY id ASC',
            [namespace]
        );
        var list = [];
        var index = 0;
        query.on('result', function(row) {
            list.push(row);
            if (list.length >= 1000) {
                index += list.length;
                callback(list, index, total, false);
                list = [];
            }
        }).on('end', function() {
            callback(list, index += list.length, total, true);
        });
    });
};

exports.timelapse = function(callback, namespace){
};
