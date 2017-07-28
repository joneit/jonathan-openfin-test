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

    //event listeners.
    document.addEventListener('DOMContentLoaded', function() {
        //OpenFin is ready
        fin.desktop.main(function() {
            //update UI and set event handlers.
            updateAdapterIndicator();
            setVersionNumber();
            // setLearnMoreEventHandler();
            setTestEventHandler();
            subscribeToInterAppBus();

            var link = document.querySelector('#test');
            link.addEventListener('click', function() {
                var childApp = new fin.desktop.Application({
                    uuid: 'crashapp',
                    name: 'crashapp',
                    url: link.innerHTML,
                    autoShow: true
                }, function(successObj) {
                    console.log('new app ACK:', JSON.stringify(successObj));

                    childApp.addEventListener('crashed', function(event) {
                        console.log('app: crashed', event);
                    });

                    childApp.addEventListener('window-crashed', function(event) {
                        console.log('app: window-crashed', event);
                    });

                    childApp.run(function(successObj) {
                        console.log('run ACK');
                    }, function(reason, error) {
                        alert('run NACK');
                    });
                }, function(reason, error) {
                    alert('new app NACK:', reason);
                });
            });
        });
    });
}());
