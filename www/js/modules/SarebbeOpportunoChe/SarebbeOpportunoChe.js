
var SarebbeOpportunoChe = {

    TAG: "SarebbeOpportunoChe",
    debug: true,

    open: false,
    expanded: false,
    startWithMenu: false,
    result: null,
    identifierModule: "SarebbeOpportunoChe",
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
    nameTemplate: "js/modules/SarebbeOpportunoChe/SarebbeOpportunoCheMainLayout.mst.html",

    setupMenu: function ()
    {
        SarebbeOpportunoChe.print('init setupMenu');
        if ($(SarebbeOpportunoChe.idMenu).length == 0)
        {
            $("#indexPage").append("<div id=\"idMenu\" class=\"commonHalfMenu\"></div>")
        }

        ViewManager.render(SarebbeOpportunoChe.results, SarebbeOpportunoChe.idMenu, SarebbeOpportunoChe.nameTemplate);
        Utility.movingPanelWithTouch(SarebbeOpportunoChe.idHandlerMenu, SarebbeOpportunoChe.idMenu);

        SarebbeOpportunoChe.print('finish setupMenu');
    },

    init: function ()
    {
        SarebbeOpportunoChe.print('on Init');
        SarebbeOpportunoChe.show();

        if (SarebbeOpportunoChe.startWithMenu)
        {
            SarebbeOpportunoChe.setupMenu();
            SarebbeOpportunoChe.showMenu();
        }
    },

    reloadMenu: function ()
    {
        SarebbeOpportunoChe.print('on ReloadMenu');
        SarebbeOpportunoChe.setupMenu();
        SarebbeOpportunoChe.showMenu();
    },

    show: function ()
    {
        //mostro il modulo
        application.resetInterface();
        SarebbeOpportunoChe.open = true;
        application.setBackButtonListener();
    },

    hide: function ()
    {
        //chiudo il modulo
        SarebbeOpportunoChe.hideMenu();
        SarebbeOpportunoChe.open = false;
    },

    hideMenu: function ()
    {
        MapManager.reduceMenuShowMap(SarebbeOpportunoChe.idMenu);
        InfoManager.removingMenuToManage(SarebbeOpportunoChe.identifierModule);
        application.removingMenuToCheck(SarebbeOpportunoChe.identifierModule);
    },

    showMenu: function ()
    {
        MapManager.showMenuReduceMap(SarebbeOpportunoChe.idMenu);
        InfoManager.addingMenuToManage(SarebbeOpportunoChe.identifierModule);
        application.addingMenuToCheck(SarebbeOpportunoChe.identifierModule);
        $(SarebbeOpportunoChe.idCollapseMenu).hide();
    },

    checkForBackButton: function ()
    {
        SarebbeOpportunoChe.print('click back');
        if (SarebbeOpportunoChe.open)
        {
            SarebbeOpportunoChe.hide();
        }
    },

    closeAll: function ()
    {
        if (SarebbeOpportunoChe.open)
        {
            SarebbeOpportunoChe.hide();
        }
    },

    expandMenu: function ()
    {
        //viene richiamato al click dell'espand menu
        Utility.expandMenu(SarebbeOpportunoChe.idMenu, SarebbeOpportunoChe.idExpandMenu, SarebbeOpportunoChe.idCollapseMenu);
        SarebbeOpportunoChe.expanded = true;
    },

    collapseMenu: function ()
    {
        //viene richiamato al click del collapse menu
        Utility.collapseMenu(SarebbeOpportunoChe.idMenu, SarebbeOpportunoChe.idExpandMenu, SarebbeOpportunoChe.idCollapseMenu);
        SarebbeOpportunoChe.expanded = false;
    },

    //////////////////// INIT SEARCH QUERY ////////////////////

    search: function ()
    {
        SarebbeOpportunoChe.print('on Search');
        var SarebbeOpportunoCheQuery = "write here query param";
        SarebbeOpportunoChe.print('query : ' + CulturalActivityQuery);
        APIClient.executeQuery(CulturalActivityQuery, SarebbeOpportunoChe.searchInformationForEachFeature, SarebbeOpportunoChe.errorQuery);
    },

    searchInformationForEachFeature(response)
    {
        SarebbeOpportunoChe.print('on searchInformationForEachFeature');
        SarebbeOpportunoChe.print('response : ' + response);
    },

    mergeResults: function (response)
    {
        SarebbeOpportunoChe.print('on mergeResults');
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
                    SarebbeOpportunoChe.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        SarebbeOpportunoChe.decrementAndCheckRetrieved();
    },

    decrementAndCheckRetrieved: function()
    {
        SarebbeOpportunoChe.print('on decrementAndCheckRetrieved');
        SarebbeOpportunoChe.responseLength--;

        if (SarebbeOpportunoChe.responseLength == 0)
        {
            SarebbeOpportunoChe.successQuery(SarebbeOpportunoChe.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //success callBack
    successQuery: function (response)
    {
        SarebbeOpportunoChe.print('init successQuery');
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

        SarebbeOpportunoChe.results = responseObject["Results"];
        SarebbeOpportunoChe.print('result = ' + SarebbeOpportunoChe.results);
        SarebbeOpportunoChe.reloadMenu();
        MapManager.addGeoJSONLayer(responseObject);
        SarebbeOpportunoChe.resetSearch();
        SarebbeOpportunoChe.print('finish successQuery');
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
        if (SarebbeOpportunoChe.debug)
        {
            console.log(SarebbeOpportunoChe.TAG + " : " + text);
        }
    },

    //////////////////// FINISH SEARCH QUERY ////////////////////

}
