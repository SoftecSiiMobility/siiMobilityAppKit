var ComportamentoVirtuoso = {

    TAG: "ComportamentoVirtuoso",
    debug: true,

    open: false,
    expanded: false,
    startWithMenu: false,
    result: null,
    identifierModule: "ComportamentoVirtuoso",
    responseLength: 0,
    temporaryResponse: null,
    vectorLayer: null,

    // Variabili per la registrazione dell'itinerario
    isRecording: false,
    watchId: null,
    trackingData: [],

    // Dichiaro gli id della layout
    idMenu: "#idMenu",
    idHandlerMenu: "#idHandlerMenu",
    idExpandMenu: "#idExpandMenu",
    idCollapseMenu: "#idCollapseMenu",
    idHeaderTitleMenu: "#idHeaderTitleMenu",
    idInnerMenu: "#idInnerMenu",
    destination: undefined,

    /*
        dichiaro il nome del template da richiamare
        Se viene mostrato il menu principale o qualcosa di strano controllare se esiste cercandolo dal terminale
        se esiste e mostra ancora qualcosa di anomalo controlla il case perchè la stringa è case sensitve
    */
    nameTemplate: "js/modules/comportamentoVirtuoso/ComportamentoVirtuosoMainLayout.mst.html",

    getDateTime: function ()
    {
        /*
            Restituisce il dateTime corrente nel formato YYYY-MM-DDTHH:MM:SS
            Utile nel caso venissero fatte più query all'API shortestpath in questo modulo
        */
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();

        if(month.toString().length == 1)
        {
            var month = '0' + month;
        }

        if(day.toString().length == 1)
        {
            var day = '0' + day;
        }

        if(hour.toString().length == 1)
        {
            var hour = '0' + hour;
        }

        if(minute.toString().length == 1)
        {
            var minute = '0' + minute;
        }

        if(second.toString().length == 1)
        {
            var second = '0' + second;
        }

        var dateTime = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;

        return dateTime;
    },

    setupMenu: function ()
    {
        ComportamentoVirtuoso.print('init setupMenu');
        if ($(ComportamentoVirtuoso.idMenu).length == 0)
        {
            $("#indexPage").append("<div id=\"idMenu\" class=\"commonHalfMenu\"></div>")
        }

        ViewManager.render(ComportamentoVirtuoso.results, ComportamentoVirtuoso.idMenu, ComportamentoVirtuoso.nameTemplate);
        Utility.movingPanelWithTouch(ComportamentoVirtuoso.idHandlerMenu, ComportamentoVirtuoso.idMenu);

        ComportamentoVirtuoso.print('finish setupMenu');
    },

    init: function ()
    {
        /*
            La init() viene richiamata quando il modulo è chiuso, tuttavia nel caso venisse richiamata
            a modulo aperto può portare a comportamenti inaspettati. Pertanto nella init() è stato
            inserito un controllo che verifica l'effettiva chiusura del modulo prima di aprirlo
            e inizializzare i dati al suo interno
        */
        if (!ComportamentoVirtuoso.open)
        {
            ComportamentoVirtuoso.print('on Init');
            ComportamentoVirtuoso.show();

            if (ComportamentoVirtuoso.startWithMenu)
            {
                ComportamentoVirtuoso.setupMenu();
                ComportamentoVirtuoso.showMenu();
            }

            /*
                Creo un pulsante per la registrazione del percorso e lo posiziono a sinistra sopra il pulsante di
                navigazione con associato un handler che verifica se c'è una registrazione in corso e notifica
                tramite un popup all'utente un'azione da eseguire
            */
            MapManager.addSingleButton('<i class=\"icon ion-record\"></i>', function() { ComportamentoVirtuoso.recordingHandler() }, 'recButton ol-unselectable ol-control', "recButton");
            $('.recButton').css({
                'bottom': '146px',
                'left': '5px'
            });
            ComportamentoVirtuoso.print('recButton created');

            // Inseriti listener per il ritorno nel menu principale dal modulo
            $("#navbar .navbar-brand.ui-link:first").on('click', ComportamentoVirtuoso.back);
            $("#navbar .pull-left:first").on('click', ComportamentoVirtuoso.back);
            document.addEventListener('backbutton', ComportamentoVirtuoso.back, false);
        }
    },

    back: function ()
    {
        /*
            Se la registrazione del percorso è attiva, impedisco la visualizzazione del menù principale
            e esce un popup in notifica all'utente la registrazione del percorso ancora attiva
            e domanda se uscire, interrompendo senza salvare la registrazione, o rimanere nel modulo
        */
        PrincipalMenu.hide();

        if (ComportamentoVirtuoso.isRecording)
        {
            ComportamentoVirtuoso.print('on back during isRecording');

            navigator.notification.confirm(
                Globalization.labels.recordingAlert.recordingForceStopConfirm,
                ComportamentoVirtuoso.forceStopRecording,
                Globalization.labels.recordingAlert.recordingForceStop,
                [Globalization.labels.recordingAlert.recordingConfirm, Globalization.labels.recordingAlert.recordingCancel]
            );
        }
        else
        {
            ComportamentoVirtuoso.backConfirmed();
        }
    },

    backConfirmed: function ()
    {
        ComportamentoVirtuoso.print('on backConfirmed');
        ComportamentoVirtuoso.hide();

        // Rimuovo eventuali percorsi disegnati sulla mappa
        if(ComportamentoVirtuoso.vectorLayer != null)
        {
            MapManager.map.removeLayer(ComportamentoVirtuoso.vectorLayer);
        }

        // Reimposto la destinazione
        ComportamentoVirtuoso.destination = undefined;

        // Rimuovo il pulsante per la registrazione del percorso ed i listener
        $('.recButton').remove();
        $("#navbar .navbar-brand.ui-link:first").off('click', ComportamentoVirtuoso.back);
        $("#navbar .pull-left:first").off('click', ComportamentoVirtuoso.back);
        document.removeEventListener('backbutton', ComportamentoVirtuoso.back);

        // Mostro finalmente il menu principale
        PrincipalMenu.show();
    },

    reloadMenu: function ()
    {
        ComportamentoVirtuoso.print('on ReloadMenu');
        ComportamentoVirtuoso.setupMenu();
        ComportamentoVirtuoso.showMenu();
    },

    show: function ()
    {
        // Mostro il modulo
        application.resetInterface();
        ComportamentoVirtuoso.open = true;
        application.setBackButtonListener();
    },

    hide: function ()
    {
        // Chiudo il modulo
        ComportamentoVirtuoso.hideMenu();
        ComportamentoVirtuoso.open = false;
    },

    hideMenu: function ()
    {
        MapManager.reduceMenuShowMap(ComportamentoVirtuoso.idMenu);
        InfoManager.removingMenuToManage(ComportamentoVirtuoso.identifierModule);
        application.removingMenuToCheck(ComportamentoVirtuoso.identifierModule);
    },

    showMenu: function ()
    {
        MapManager.showMenuReduceMap(ComportamentoVirtuoso.idMenu);
        InfoManager.addingMenuToManage(ComportamentoVirtuoso.identifierModule);
        application.addingMenuToCheck(ComportamentoVirtuoso.identifierModule);
        $(ComportamentoVirtuoso.idCollapseMenu).hide();
    },

    checkForBackButton: function ()
    {
        ComportamentoVirtuoso.print('click back');
        if (ComportamentoVirtuoso.open)
        {
            ComportamentoVirtuoso.hide();
        }
    },

    closeAll: function ()
    {
        if (ComportamentoVirtuoso.open)
        {
            ComportamentoVirtuoso.hide();
        }
    },

    expandMenu: function ()
    {
        // Viene richiamato al click dell'espand menu
        Utility.expandMenu(ComportamentoVirtuoso.idMenu, ComportamentoVirtuoso.idExpandMenu, ComportamentoVirtuoso.idCollapseMenu);
        ComportamentoVirtuoso.expanded = true;
    },

    collapseMenu: function ()
    {
        // Viene richiamato al click del collapse menu
        Utility.collapseMenu(ComportamentoVirtuoso.idMenu, ComportamentoVirtuoso.idExpandMenu, ComportamentoVirtuoso.idCollapseMenu);
        ComportamentoVirtuoso.expanded = false;
    },

    recordingHandler: function ()
    {
        /*
            Verifica se c'è una registrazione dell'itinerario in corso. Se non è attiva nesusna registrazione,
            domanda all'utente se vuole avviarla. Se la registrazione è attiva, domanda all'utente se vuole interromperla
        */
        ComportamentoVirtuoso.print("on recordingHandler");
        if (ComportamentoVirtuoso.isRecording === false)
        {
            navigator.notification.confirm(
                Globalization.labels.recordingAlert.recordingStartConfirm,
                ComportamentoVirtuoso.startRecording,
                Globalization.labels.recordingAlert.recordingStart,
                [Globalization.labels.recordingAlert.recordingConfirm, Globalization.labels.recordingAlert.recordingCancel]
            );
        }
        else
        {
            navigator.notification.confirm(
                Globalization.labels.recordingAlert.recordingStopConfirm,
                ComportamentoVirtuoso.stopRecording,
                Globalization.labels.recordingAlert.recordingStop,
                [Globalization.labels.recordingAlert.recordingConfirm, Globalization.labels.recordingAlert.recordingCancel]
            );
        }
    },

    startRecording: function (buttonIndex = 0)
    {
        /*
            Avvia la registrazione del percorso con i plugin di geolocalizzazione di Apache Cordova.
            Cambia l'icona del pulsante di registrazione e avvia il tracciamento dell'utante, chiamando una
            callback a cui passerà la posizione ogni tre secondi 
        */
        if (buttonIndex === 1)
        {
            ComportamentoVirtuoso.print('on startRecording');
            $('.ion-record').addClass('ion-stop').removeClass('ion-record');

            var geolocationOptions = {
                maximumAge: 3600000,
                timeout: 3000,
                enableHighAccuracy: true
            };

            ComportamentoVirtuoso.isRecording = true;
            ComportamentoVirtuoso.watchId = navigator.geolocation.watchPosition(ComportamentoVirtuoso.recordingSuccess, ComportamentoVirtuoso.recordingError, geolocationOptions);
        }
    },

    recordingSuccess: function (position)
    {
        // Inserisce in un array i dati della posizione rilevati
        ComportamentoVirtuoso.print("on recordingSuccess");
        ComportamentoVirtuoso.trackingData.push(position);
    },

    recordingError: function (error)
    {
        ComportamentoVirtuoso.print("on recordingError");
        ComportamentoVirtuoso.print("error code: " + error.code);
        ComportamentoVirtuoso.print("error message: " + error.message);
    },

    stopRecording: function (buttonIndex = 0)
    {
        /*
            Quando viene interrotta la registrazione, un popup chiederà all'utente se vuole salvare
            l'itinerario registrato
        */
        if (buttonIndex === 1)
        {
            ComportamentoVirtuoso.print('on stopRecording');

            navigator.geolocation.clearWatch(ComportamentoVirtuoso.watchId);
            
            navigator.notification.confirm(
                Globalization.labels.recordingAlert.recordingSaveConfirm,
                ComportamentoVirtuoso.recordSaveHandler,
                Globalization.labels.recordingAlert.recordingSave,
                [Globalization.labels.recordingAlert.recordingSavePath, Globalization.labels.recordingAlert.recordingSaveNoPath]
            );
        }
    },

    recordSaveHandler: function (buttonIndex = 0)
    {
        /*
            Interrompe il tracciamento della posizione e, a seconda dell'input utente, salva o cancella i dati
            di geolocalizzazione salvati fino all'interruzione. In caso di salvataggio, in futuro verrà implementata
            una chiaamta all'API di Sii-Mobility per salvare su di esso il percorso tracciato
        */
        ComportamentoVirtuoso.print('on recordSaveHandler');
        $('.ion-stop').addClass('ion-record').removeClass('ion-stop');

        if (buttonIndex === 1)
        {
            ComportamentoVirtuoso.print('on recordSaveHandler during saving');
            var trackingDataObjectizedArray = [];
            var trackingDataJSONized = "";
            var wktArray = [];

            for (var i = 0; i < ComportamentoVirtuoso.trackingData.length; i++)
            {
                var trackingDataObjectized = {
                    latitude: ComportamentoVirtuoso.trackingData[i].coords.latitude,
                    longitude: ComportamentoVirtuoso.trackingData[i].coords.longitude,
                    altitude: ComportamentoVirtuoso.trackingData[i].coords.altitude,
                    accuracy: ComportamentoVirtuoso.trackingData[i].coords.accuracy,
                    altitudeAccuracy: ComportamentoVirtuoso.trackingData[i].coords.altitudeAccuracy,
                    heading: ComportamentoVirtuoso.trackingData[i].coords.heading,
                    speed: ComportamentoVirtuoso.trackingData[i].coords.speed,
                    timestamp: ComportamentoVirtuoso.trackingData[i].timestamp
                };

                var wktLongLat = ComportamentoVirtuoso.trackingData[i].coords.longitude + " " + ComportamentoVirtuoso.trackingData[i].coords.latitude;

                trackingDataObjectizedArray.push(trackingDataObjectized);
                wktArray.push(wktLongLat);
            }

            var wktString = "LINESTRING(" + wktArray.join() + ")";
            trackingDataJSONized = JSON.stringify(trackingDataObjectizedArray);

            /*
                @TODO:
                Implementare invio all'API di Sii-Mobility del json serializzato in trackingDataJSONized
            */

            ComportamentoVirtuoso.print("trackingDataJSONized : " + trackingDataJSONized);
            ComportamentoVirtuoso.print("wktString : " + wktString);

            MapManager.addSelectedGeometry(wktString);
        }

        ComportamentoVirtuoso.isRecording = false;
        ComportamentoVirtuoso.watchId = null;
        ComportamentoVirtuoso.trackingData = [];
    },

    forceStopRecording: function (buttonIndex = 0)
    {
        /*
            Forza l'interruzione del tracciamento dell'itinerario senza salvare e ritorna al menu principale
            dell'app. Questa funzione viene invocata nel caso di conferma interruzione registrazione inviata
            dall'utente dal popup che appare nel caso volesse tornare nel menu principale da backbutton
            o dall'icona dell'applicazione in alto a sinistra
        */
        if (buttonIndex === 1 && ComportamentoVirtuoso.isRecording)
        {
            ComportamentoVirtuoso.print('on forceStopRecording');

            navigator.geolocation.clearWatch(ComportamentoVirtuoso.watchId);

            ComportamentoVirtuoso.isRecording = false;
            ComportamentoVirtuoso.watchId = null;
            ComportamentoVirtuoso.trackingData = [];

            ComportamentoVirtuoso.backConfirmed();
        }
    },

    calculatePath: function (destination)
    {
        // destination può essere una service URI oppure delle coordinate geografiche
        ComportamentoVirtuoso.print('destination : ' + destination);

        if (ComportamentoVirtuoso.open === false)
        {
            // Inizializza ComportamentoVirtuoso se calculatePath() è chiamata esternamente dal modulo
            ComportamentoVirtuoso.init();
            SearchManager.search('ComportamentoVirtuoso');
            ComportamentoVirtuoso.print('called calculatePath() from engagement');
        }

        if (destination !== undefined)
        {
            var gpsCoordinates = MapManager.gpsMarkerCoordinates();

            if (!Array.isArray(destination))
            {
                ComportamentoVirtuoso.print('not array');
                /*
                    Se destination non è un array di coordinate geografiche, allora è una URL di una
                    risorsa di Serivce Map e bisogna inserirla in un array come unico valore
                */
                ComportamentoVirtuoso.destination = [destination];
            }
            else
            {
                ComportamentoVirtuoso.destination = destination;
            }

            /*
                Query per richiedere a Sii-Mobility il percorso e la successiva visualizzazione
                dello stesso sulla mappa dell'applicazione
            */
            ComportamentoVirtuoso.print('destination : ' + ComportamentoVirtuoso.destination);
            var pathQuery = QueryManager.createShortestPathQuery(gpsCoordinates, ComportamentoVirtuoso.destination, 'foot_shortest', ComportamentoVirtuoso.getDateTime(), 'user');

            ComportamentoVirtuoso.print('query : ' + pathQuery);
            APIClient.executeQuery(pathQuery, ComportamentoVirtuoso.searchInformationForEachFeature, ComportamentoVirtuoso.errorQuery);
        }
    },

    //////////////////// INIT SEARCH QUERY ////////////////////

    search: function ()
    {
        ComportamentoVirtuoso.print('on Search');

    },

    searchInformationForEachFeature: function (response)
    {
        ComportamentoVirtuoso.print('on searchInformationForEachFeature');
        ComportamentoVirtuoso.print('response : ' + response);

        // Disegno il percorso sulla mappa
        MapManager.addSelectedGeometry(response["journey"]["routes"][0]["wkt"]);

        ComportamentoVirtuoso.print('finish searchInformationForEachFeature');
    },

    mergeResults: function (response)
    {
        ComportamentoVirtuoso.print('on mergeResults');
        for (var category in response)
        {
            if (response[category].features != null)
            {
                if (response[category].features.length != 0)
                {
                    if (response.realtime != null)
                    {
                        if (response.realtime.results != null)
                        {
                            if (response.realtime.results.bindings[0] != null)
                            {

                            }
                        }
                    }
                    ComportamentoVirtuoso.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        ComportamentoVirtuoso.decrementAndCheckRetrieved();
    },

    decrementAndCheckRetrieved: function ()
    {
        ComportamentoVirtuoso.print('on decrementAndCheckRetrieved');
        ComportamentoVirtuoso.responseLength--;

        if (ComportamentoVirtuoso.responseLength == 0)
        {
            ComportamentoVirtuoso.successQuery(ComportamentoVirtuoso.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    // Success callBack
    successQuery: function (response)
    {
        ComportamentoVirtuoso.print('init successQuery');
        var responseObject = response;

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker")
        {
            MapManager.searchOnSelectedServiceMarker = true;
        }

        for (var i = 0; i < responseObject["Results"].features.length; i++)
        {
            responseObject["Results"].features[i].id = i;
            Utility.enrichService(responseObject["Results"].features[i], i);
        }

        if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null)
        {
            responseObject["Results"].features.sort(function (a, b)
            {
                return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
            });
        }
        else
        {
            responseObject["Results"].features.sort(function (a, b)
            {
                return a.properties.distanceFromGPS - b.properties.distanceFromGPS
            });
        }

        ComportamentoVirtuoso.results = responseObject["Results"];
        ComportamentoVirtuoso.print('result = ' + ComportamentoVirtuoso.results);
        ComportamentoVirtuoso.reloadMenu();
        MapManager.addGeoJSONLayer(responseObject);
        ComportamentoVirtuoso.resetSearch();
        ComportamentoVirtuoso.print('finish successQuery');
    },

    // CallBack
    errorQuery: function (error)
    {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function ()
    {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    print: function (text)
    {
        if (ComportamentoVirtuoso.debug)
        {
            console.log(ComportamentoVirtuoso.TAG + " : " + text);
        }
    },
}
