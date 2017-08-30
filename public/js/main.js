(function() {
    'use strict';

    //set the adapter ready UI indicator
    var updateAdapterIndicator = function() {
        var statusIndicator = document.querySelector('#status-indicator');
        statusIndicator.classList.toggle("online");
    };

    //set the OpenFin version number on the page
    var setVersionNumber = function() {
        var versionNumberContainer = document.querySelector('#version-number-container'),
            ofVersion = document.querySelector('#of-version');

        fin.desktop.System.getVersion(function(version) {
            ofVersion.innerText = version;
            versionNumberContainer.classList.toggle('invisible');
        });
    };

    //add the event listener for the learn more button.
    var setLearnMoreEventHandler = function() {
        var learnMoreButton = document.querySelector('#learn-more');

        learnMoreButton.addEventListener('click', function() {
            fin.desktop.System.openUrlWithBrowser('https://openfin.co/developers/javascript-api/');
        });
    };

    //add the event listener for the Test button.
    var setTestEventHandler = function() {
        var learnMoreButton = document.querySelector('#test');

        learnMoreButton.addEventListener('click', function() {
            fin.desktop.System.getMousePosition(function(mousePosition) {
                console.log("The mouse is located at left: " + mousePosition.left + ", top: " + mousePosition.top);
            }, function(error) {
                console.log('ERROR:', error);
            });
        });
    };

    var setVisibilityDisplayOnce = function() {
        document.querySelector('#inter-app-messages').style.display = 'block';
        setVisibilityDisplayOnce = function() {};
    };

    var subscribeToInterAppBus = function() {
        var messageCtrl = document.querySelector('#message'),
            timeStampCtrl = document.querySelector('#time');

        fin.desktop.InterApplicationBus.subscribe('*', 'inter:app:sub', function(msg) {
            setVisibilityDisplayOnce();
            messageCtrl.innerText = msg.message;
            timeStampCtrl.innerText = new Date(msg.timeStamp).toLocaleTimeString();
        });
    };

    //add the event listener for the Test button.
    var openChildWindow = function(n, color, rect, callback) {
        var win = new fin.desktop.Window({
            name: "childWindow" + n,
            frame: true,
            resizable: true,
            autoShow: true,
            state: "normal"
        }, function() {
            var document = win.getNativeWindow().document,
                pre = document.createElement('pre'),
                style = pre.style;
            style.backgroundColor = color;
            style.margin = '8px';
            style.position = 'absolute';
            style.top = style.left = style.right = style.bottom = '0';
            pre.innerText = JSON.stringify(rect, undefined, 4);
            document.body.style.backgroundColor = 'red';
            document.body.appendChild(pre);
            callback(win, n);
        }, function(error) {
            console.log("Error creating window:", error);
        });
        console.log('BEFORE', JSON.stringify(win, undefined, 2));
        return win;
    };

    //event listeners.
    document.addEventListener('DOMContentLoaded', function() {
        //OpenFin is ready
        fin.desktop.main(function() {
            //update UI and set event handlers.
            updateAdapterIndicator();
            setVersionNumber();
            setLearnMoreEventHandler();
            setTestEventHandler();
            subscribeToInterAppBus();

            var parentWindow = fin.desktop.Window.getCurrent();
            parentWindow.focus();
            parentWindow.getNativeWindow().document.addEventListener('click', function() {
                parentWindow.focus();
            });

            var n = 0,
                colors = ['#fdd', '#dfd', '#ddf'],
                interval, rects, majorVersionNumber;

            fin.desktop.System.getMonitorInfo(info => {
                rects = [addWidthHeight(info.primaryMonitor)]
                    .concat(info.nonPrimaryMonitors.map(monitor => addWidthHeight(monitor)));
                interval = setInterval(child, 2000);
            });

            fin.desktop.Application.getCurrent().getManifest(manifest => {
                majorVersionNumber = Number(manifest.runtime.version.split('.')[0]);
            });

            function child() {
                var rect = rects[n],
                    color = colors[n];
                n += 1;
                if (n <= rects.length) {
                    openChildWindow(n, color, rect, function(win) {
                        console.log('AFTER', win);
                        win.moveTo(rect.left, rect.top, () => {
                            win.resizeTo(rect.width, rect.height);
                        });
                    });
                } else {
                    clearInterval(interval);
                }
            }

            function addWidthHeight(monitorInfo) {
                var rect = Object.assign({}, monitorInfo.monitorRect);
                rect.width = rect.right - rect.left;
                rect.height = rect.bottom - rect.top;
                rect.monitorInfo = monitorInfo;
                return rect;
            }
        });
    });
})();
