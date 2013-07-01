/**
 * Wall interface
 */
var WallInterface = (function() {
    var progressBar = $('#bar-load');
    var playBar = $('#bar-play');
    var _onColorSelect = function(){};
    var _onWidthSelect = function(){};

    var _colorlist = [];
    // Populate colours
    $('#colour-selector a div').each(function(){
        _colorlist.push($(this).css('background-color'));
    });

    var _selectColor = function(index) {
        var selector = $('#colour-selector a div');
        selector.removeClass('active');
        selector.filter(function(i){
            if (i == index) {
                $(this).addClass('active');
            }
        });

        return _colorlist[index];
    };

    // On click set color
    $('#colour-selector').on('click', 'a', function(e){
        e.preventDefault();

        _onColorSelect(_selectColor($(this).parent().index()));
    });

    // On click set width
    $('#brush-selector').on('click', 'li', function(e){
        e.preventDefault();

        $('#brush-selector li').removeClass('active');
        $(this).addClass('active');

        _onWidthSelect($(this).data('size'));
    });


    var _showTab = function(tabName, parent) {
        $(parent+' div.tab').removeClass('visible');
        $(parent+' div.' + tabName + '.tab').addClass('visible');
    };

    var _getProgress = function(current, total) {
        if (! total) {
            return 0;
        }
        return current / total;
    };

    return {
        showError: function() {
            _showTab('error', '#main_content');
        },
        showAbout: function() {
            _showTab('about', '#main_content');
        },
        showDraw: function() {
            _showTab('draw', '#main_content');
        },
        showTimelapse: function() {
            _showTab('timelapse', '#main_content');
            _showTab('loading', '.navbar');
        },
        switchToDraw: function() {
            _showTab('draw', '.navbar');
        },
        switchToLoading: function() {
            _showTab('loading', '.navbar');
        },
        onColorSelect: function(callback) {
            _onColorSelect = callback;
        },
        onWidthSelect: function(callback) {
            _onWidthSelect = callback;
        },
        getRandomColor: function() {
            return _selectColor(Math.floor(Math.random() * _colorlist.length));
        },
        getDefaultWidth: function() {
            return $('#brush-selector li.active').data('size');
        },
        progress: function(current, total) {
            var p = Math.round(_getProgress(current, total) * 100) + '%';
            $(progressBar).css('width', p);
        },
        playProgress: function(current, total) {
            var p = Math.round(_getProgress(current, total) * 100) + '%';
            $(playBar).css('width', p);
        }
    };
});

/**
 * Drawing Wall object
 */
var Wall = (function(canvasObject) {
    var _canvas = canvasObject;
    var _enabled = false;
    var _color;
    var _width;

    var _drawCallback = function(){};

    // Init
    var _click = false;
    var _p;
    _canvas.mousedown(function(p){
        if (_enabled) {
            _click = true;
            _p = p;
            var data = {
                x1: _p.x,
                y1: _p.y,
                x2: _p.x,
                y2: _p.y,
                width: _width,
                color: _color
            };
            _canvas.draw(data);
            _drawCallback(data);
        }
    });
    _canvas.mouseup(function(e){
        _click = false;
    });

    _canvas.mousemove(function(np){
        if (_click && _enabled) {
            var data = {
                x1: np.x,
                y1: np.y,
                x2: _p.x,
                y2: _p.y,
                width: _width,
                color: _color
            };
            _canvas.draw(data);
            _drawCallback(data);
            _p = np;
        }
    });

    // Prevent scrolling of the entire body
    document.body.addEventListener('touchmove', function(event){
        event.preventDefault();
    }, false);

    return {
        clear: function() {
            _canvas.clear();
        },
        resizeToElement: function(element, callback, delay) {
            var timeout;
            $(window).resize(function() {
                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function() {
                    _canvas.resize(element, callback);
                }, delay);
            });
            // Do it now
            _canvas.resize(element);
        },
        draw: function(data) {
            _canvas.draw(data);
        },
        drawUnder: function(data) {
            _canvas.drawUnder(data);
        },
        setColor: function(c) {
            _color = c;
        },
        setWidth: function(w) {
            _width = w;
        },
        setDrawCallback: function(callback) {
            _drawCallback = callback;
        },
        enable: function() {
            _enabled = true;
        },
        disable: function() {
            _enabled = false;
        }
    };
});

/**
 * Timelapse Display object
 */
var Timelapse = (function(CanvasObject){
    var _canvas = CanvasObject;

    var _frames = [];
    var _running = false;
    var _total = 1;
    var _progress = 0;
    var _dataProgress = 0;
    var _loading = false;

    var _loadProgress = function(index, total){};
    var _playProgress = function(index, total){};
    var _initiateLoading = function(){};

    return {
        receive: function(response) {
            // Don't accept data if we aren't on
            if (! _running && !_loading) return;
            _total = response.total;
            for (var i = 0, length = response.data.length; i < length; i++) {
                _loadProgress(_dataProgress++, _total);
                _frames.push(response.data[i]);
            }
            if (response.end) {
                _loading = false;
            }
        },
        start: function() {
            if (_running) return;
            _running = true;
            _playProgress(0,1);
            if (!_loading) _initiateLoading();
            // Start the animation from _frames;
            var anim = function() {
                var f = 0;
                while(f++ < 100 && _frames.length) {
                    var frame = _frames.shift();
                    _playProgress(_progress++, _total);
                    _canvas.draw(frame);
                }

                // Convert to use propepr framed anim
                if (_running && (_loading || _frames.length)) {
                    setTimeout(anim, 50);
                } else {
                    _running = false;
                }
            };
            anim();
        },
        abort: function() {
            _frames = [];
            _running = false;
            _total = 1;
            _progress = 0;
            _canvas.clear();
        },
        loadProgress: function(callback) {
            _loadProgress = callback;
        },
        playProgress: function(callback) {
            _playProgress = callback;
        },
        initiateLoading: function(callback) {
            _initiateLoading = function(){
                _loading = true;
                _loadProgress(0,1);
                callback(_canvas.getSize());
            };
        }
    };
});

/**
 * Canvas Wrapping object
 */
var CanvasObject = (function(ctx){
    var _canvasElement = ctx;
    var _context = ctx[0].getContext('2d');

    var _scale = function() {
        if ('devicePixelRatio' in window) {
            if (window.devicePixelRatio > 1 && _context.webkitBackingStorePixelRatio < 2) {
                return window.devicePixelRatio;
            }
        }
        return 1;
    }();

    var __draw = function(x1, y1, x2, y2, width, color) {
        _context.fillStyle = color;
        _context.strokeStyle = color;
        _context.lineWidth = width*2;

        _context.beginPath();
        _context.moveTo(x2, y2);
        _context.lineTo(x1, y1);
        _context.stroke();
        _context.closePath();

        _context.beginPath();
        _context.arc(x1, y1, width, 0, Math.PI*2, true);
        _context.closePath();
        _context.fill();
    };

    var _draw = function(data) {
        __draw(
            data.x1,
            data.y1,
            data.x2,
            data.y2,
            data.width,
            data.color
        );
    };

    var _getPosition = function(e) {
        var targ;
        if (!e)
            e = window.event;
        if (e.target)
            targ = e.target;
        else if (e.targetTouches) {
            return {
                x: e.targetTouches[0].pageX,
                y: e.targetTouches[0].pageY
            };
        } else if (e.srcElement)
            targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        var x = e.pageX - $(targ).offset().left;
        var y = e.pageY - $(targ).offset().top;

        return {x: x, y: y};
    };

    return {
        draw: function(data) {
            _draw(data);
        },
        drawUnder: function(data) {
            _context.globalCompositeOperation = 'destination-over';
            _draw(data);
            _context.globalCompositeOperation = 'source-over';
        },
        clear: function() {
            _context.clearRect(
                0,
                0,
                _canvasElement.width(),
                _canvasElement.height()
            );
        },
        getSize: function() {
            return {
                width: _canvasElement.width(),
                height: _canvasElement.height()
            };
        },
        resize: function(element, callback) {
            callback = callback || function(){};
            if (element.width() * _scale > _canvasElement.width() ||
                element.height() * _scale > _canvasElement.height())
            {
            // If we are making canvas bigger fire callback
                _canvasElement.attr({
                    width: element.width() * _scale,
                    height: element.height() * _scale
                });
                callback();
            }
        },
        mousemove: function(callback) {
            _canvasElement.mousemove(function(e) {
                e.preventDefault();

                var p = _getPosition(e);
                callback(p);
            });

            _canvasElement[0].addEventListener('touchmove', function(event) {
                // Try to capture all touch events
                var touches = [];
                var i, len = event.targetTouches.length;
                for (i = 0; i < len; i++) {
                    touches.push({
                        id: i,
                        x: event.targetTouches[i].pageX,
                        y: event.targetTouches[i].pageY
                    });
                }
                callback(touches[0]);
            }, false);
        },
        mousedown: function(callback) {
            _canvasElement.mousedown(function(e) {
                e.preventDefault();

                var p = _getPosition(e);
                callback(p);
            });
            _canvasElement[0].addEventListener('touchstart', function(event) {
                var p = _getPosition(event);
                callback(p);
            });
        },
        mouseup: function(callback) {
            $(window).mouseup(callback);
            _canvasElement[0].addEventListener('touchend', function(e) {
                callback(e);
            });
        }
    };
});