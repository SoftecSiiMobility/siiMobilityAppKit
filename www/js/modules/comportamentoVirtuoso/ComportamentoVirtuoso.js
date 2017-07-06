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

    //dichiaro gli id della layout
    idMenu: "#idMenu",
    idHandlerMenu: "#idHandlerMenu",
    idExpandMenu: "#idExpandMenu",
    idCollapseMenu: "#idCollapseMenu",
    idHeaderTitleMenu: "#idHeaderTitleMenu",
    idInnerMenu: "#idInnerMenu",

    /*
    dichiaro il nome del template da richiamare
    Se viene mostrato il menu principale o qualcosa di strano controllare se esiste cercandolo dal terminale
    se esiste e mostra ancora qualcosa di anomalo controlla il case perchè la stringa è case sensitve
    */
    nameTemplate: "js/modules/comportamentoVirtuoso/ComportamentoVirtuosoMainLayout.mst.html",

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
        ComportamentoVirtuoso.print('on Init');
        ComportamentoVirtuoso.show();

        if (ComportamentoVirtuoso.startWithMenu)
        {
            ComportamentoVirtuoso.setupMenu();
            ComportamentoVirtuoso.showMenu();
        }
    },

    reloadMenu: function ()
    {
        ComportamentoVirtuoso.print('on ReloadMenu');
        ComportamentoVirtuoso.setupMenu();
        ComportamentoVirtuoso.showMenu();
    },

    show: function ()
    {
        //mostro il modulo
        application.resetInterface();
        ComportamentoVirtuoso.open = true;
        application.setBackButtonListener();
    },

    hide: function ()
    {
        //chiudo il modulo
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
        //viene richiamato al click dell'espand menu
        Utility.expandMenu(ComportamentoVirtuoso.idMenu, ComportamentoVirtuoso.idExpandMenu, ComportamentoVirtuoso.idCollapseMenu);
        ComportamentoVirtuoso.expanded = true;
    },

    collapseMenu: function ()
    {
        //viene richiamato al click del collapse menu
        Utility.collapseMenu(ComportamentoVirtuoso.idMenu, ComportamentoVirtuoso.idExpandMenu, ComportamentoVirtuoso.idCollapseMenu);
        ComportamentoVirtuoso.expanded = false;
    },

    //////////////////// INIT SEARCH QUERY ////////////////////

    search: function ()
    {
        ComportamentoVirtuoso.print('on Search');
        var CulturalActivityQuery = "shortestpath/?source=43.86008150000001;11.1286246&destination=http://www.disit.org/km4city/resource/ad77f05cc308d96163c455e806b2694d";
        ComportamentoVirtuoso.print('query : ' + CulturalActivityQuery);
        APIClient.executeQuery(CulturalActivityQuery, ComportamentoVirtuoso.searchInformationForEachFeature, ComportamentoVirtuoso.errorQuery);
    },

    searchInformationForEachFeature(response)
    {
        ComportamentoVirtuoso.print('on searchInformationForEachFeature');
        ComportamentoVirtuoso.print('response : ' + response);
        MapManager.addGeometryWktElement(response["journey"]["routes"][0]["wkt"]);
        /*
        for (var category in response)
        {
            if (response[category].features.length != 0)
            {
                ComportamentoVirtuoso.responseLength = response[category].features.length;
                ComportamentoVirtuoso.temporaryResponse =
                {
                    "Results": {
                        "features": [],
                        "fullCount": ComportamentoVirtuoso.responseLength,
                        "type": "FeatureCollection",
                    }
                };

                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++)
                {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, ComportamentoVirtuoso.mergeResults, ComportamentoVirtuoso.decrementAndCheckRetrieved);
                }
            }
            else
            {
                ComportamentoVirtuoso.print('##startAutoSearch## -> ' + ComportamentoVirtuoso.identifierModule);
                SearchManager.startAutoSearch(ComportamentoVirtuoso.identifierModule);
            }
        }
        */
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

    decrementAndCheckRetrieved: function()
    {
        ComportamentoVirtuoso.print('on decrementAndCheckRetrieved');
        ComportamentoVirtuoso.responseLength--;

        if (ComportamentoVirtuoso.responseLength == 0)
        {
            ComportamentoVirtuoso.successQuery(ComportamentoVirtuoso.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //success callBack
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

    //callBack
    errorQuery: function(error)
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

    //////////////////// FINISH SEARCH QUERY ////////////////////

}
