// Mobile Router
// =============
var Config = null;
var Storage = null;

var MarketIndex = {
    MAIN_INDEX: 'MAIN_INDEX',
    JSE_SELECT: 'JSE_SELECT',
    ALL_JAMAICAN: 'ALL_JAMAICAN',
    CROSS_LISTED: 'CROSS_LISTED'
};
var MarketIndexTab = {
    INFO: 'INFO',
    PERFORMANCE: 'PERFORMANCE',
    HISTORY: 'HISTORY',
    COMPOSITION: 'COMPOSITION'
};

var QuoteTab = {
    QUOTE: 'QUOTE',
    ORDINARY: 'ORDINARY',
    PREFERENCE: 'PREFERENCE',
    US_DENONINATED: 'US_DENONINATED'
};

var SymbolDetailTab = {
    PERFORMANCE: 'PERFORMANCE',
    TRADE_DATA: 'TRADE_DATA'
};

var options = {
    indexName: MarketIndex.MAIN_INDEX,
    indexTab: MarketIndexTab
};

var liveDada = {};
var Monitor = {};

// Includes file dependencies
define(["jquery", "backbone", "indexjs", "AppModules"],
        function($, Backbone, indexjs, AppModules) {
            //Import Modules
            Config = AppModules.Config;
            LiveData = AppModules.Utility.LiveData;
            Storage = AppModules.Utility.Storage;
            Monitor = AppModules.Utility.Monitor;

            var CategoryRouter = Backbone.Router.extend({
                initialize: function() {
                    this.indexDetailsView = new AppModules.Views.IndexDetailsView({el: "#appview", model: new AppModules.Models.MarketIndexFull()});
                    this.homeView = new AppModules.Views.HomeView({el: "#appview", model: new AppModules.Models.DailyMainMarketSummary()});
                    this.quoteView = new AppModules.Views.QuoteView({el: "#appview", model: new AppModules.Models.Quote()});
                    this.newsView = new AppModules.Views.NewsView({el: "#appview", model: new AppModules.Models.News()});
                    this.newsItemView = new AppModules.Views.NewsItemView({el: "#appview", model: new AppModules.Models.NewsItem()});
                    this.symbolDetailView = new AppModules.Views.SymbolDetailView({el: "#appview", model: new AppModules.Models.SymbolDetail()});
                    this.disclaimerView = new AppModules.Views.DisclaimerView({el: "#appview", model: null});
                    this.aboutView = new AppModules.Views.AboutView({el: "#appview", model: null});

                    this.symbolView = new AppModules.Views.SymbolView({el: "#appview", model: new AppModules.Models.Symbol()});
                    this.symbolView.refresh();

                    $.ajax({
                        type: "POST",
                        url: Config.baseurl + '/config',
                        data: {},
                        dataType: "json",
                        success: function(data) {
                            Config.stockDate = data.stock_date;
                            $('.market-date').text(data.stock_date_full);
                            Config.fullDate = data.stock_date_full;
                            Backbone.history.start();
                        }
                    });
                    LiveData.start();
                    Monitor.start();
                },
                // Backbone.js Routes
                routes: {
                    // When there is no hash bang on the url, the home method is called
                    "": "home",
                    "home": "home",
                    "report": "report",
                    "calendar": "calendar",
                    "news?:id": "viewnews",
                    "news": "news",
                    "quote": "quote",
                    "indexdetails": "indexdetails",
                    "symboldetail?:id": "symboldetail",
                    "disclaimer": "disclaimer",
                    "about":"about"
                },
                route: function(route, name, callback) {

                    var router = this;
                    if (!callback)
                        callback = this[name];

                    var f = function() {
                        $("#index-navbar").hide();
                        $("#index-details-navbar").hide();
                        $("#quote-navbar").hide();
                        $("#symbol-navbar").hide();
                        this.resetIcons();
                        $.mobile.loading("show");
                        callback.apply(router, arguments);
                    };
                    return Backbone.Router.prototype.route.call(this, route, name, f);
                },
                resetIcons: function() {
                    $('#home-icon').removeClass('ui-icon-home-a');
                    $('#quote-icon').removeClass('ui-icon-quote-a');
                    $('#news-icon').removeClass('ui-icon-news-a');
                },
                // Home method
                home: function() {
                    $('#home-icon').addClass('ui-icon-home-a');
                    $("#index-navbar").show();
                    var self = this;

                    var success = function() {
                        self.homeView.render();
                        $.mobile.changePage("#", {reverse: false, changeHash: false});
                        self.homeView.getMarketIndexDetails();
                    };

                    var error = function() {
                        console.log('ajax error');
                    };

                    this.homeView.model.fetch({success: success, error: error});

                    $('div[data-role="navbar"] ul li a#main_index, a#jse_select, a#all_jamaican, a#cross_listed').on('click', function(e) {
                        e.preventDefault();
                        var el = e.target.id;
                        switch (el)
                        {
                            case 'main_index':
                                options.indexName = MarketIndex.MAIN_INDEX;
                                break;
                            case 'jse_select':
                                options.indexName = MarketIndex.JSE_SELECT;
                                break;
                            case 'all_jamaican':
                                options.indexName = MarketIndex.ALL_JAMAICAN;
                                break;
                            case 'cross_listed':
                                options.indexName = MarketIndex.CROSS_LISTED;
                                break;
                        }

                        $('.act-index-name').text($(e.target).text());
                        self.homeView.changeGraph();
                        self.homeView.getMarketIndexDetails();
                    });
                },
                indexdetails: function() {
                    var self = this;
                    $("#index-details-navbar").show();

                    this.indexDetailsView.showFirstTab();

                    var success = function() {
                        self.indexDetailsView.render();
                        console.log('indexdetails success');
                    };

                    var error = function() {
                        console.log('ajax error');
                    };

                    $('#index-details-navbar ul li a').on('click', function(e) {
                        e.preventDefault();
                        var el = e.target.id;
                        var divId = '';
                        switch (el)
                        {
                            case 'info':
                                options.indexTab = MarketIndexTab.INFO;
                                divId = '#index-information-tab';
                                break;
                            case 'performance':
                                options.indexTab = MarketIndexTab.PERFORMANCE;
                                divId = '#index-performance-tab';
                                break;
                            case 'history':
                                options.indexTab = MarketIndexTab.HISTORY;
                                divId = '#index-history-tab';
                                break;
                            case 'composition':
                                options.indexTab = MarketIndexTab.COMPOSITION;
                                divId = '#index-composition-tab';
                                break;
                        }
                        self.indexDetailsView.changeTab(divId);

                    });

                    this.indexDetailsView.model.fetch({success: success, error: error});

                },
                news: function() {
                    $('#news-icon').addClass('ui-icon-news-a');
                    var self = this;
                    var success = function() {
                        $.mobile.loading("hide");
                        self.newsView.render();
                    };
                    var error = function() {
                        $.mobile.loading("hide");
                    };
                    this.newsView.model.fetch({success: success, error: error});
                },
                viewnews: function(id) {
                    this.newsItemView.render(id);
                },
                symboldetail: function(id) {
                    var self = this;
                    $("#symbol-navbar").show();

                    this.symbolDetailView.render(id);

                    $('#symbol-navbar ul li a').on('click', function(e) {
                        e.preventDefault();
                        var el = e.target.id;
                        var divId = '';
                        switch (el)
                        {
                            case 'trade-data-tab':
                                divId = '#trade-data-tab-page';
                                break;
                            case 'performance-tab':
                                divId = '#performance-tab-page';
                                break;
                        }
                        self.symbolDetailView.changeTab(divId);
                    });
                    $("#trade-data-tab").trigger("click");
                },
                quote: function() {
                    $('#quote-icon').addClass('ui-icon-quote-a');
                    $("#quote-navbar").show();
                    var self = this;
                    var success = function() {
                        self.quoteView.render();
                    };
                    var error = function() {

                    };

                    $('#quote-navbar ul li a').on('click', function(e) {

                        e.preventDefault();
                        var el = e.target.id;
                        var divId = '';
                        switch (el)
                        {
                            case 'quote-tab':
                                options.indexTab = MarketIndexTab.INFO;
                                divId = '#quote-tab-page';
                                break;
                            case 'ordinary-tab':
                                options.indexTab = MarketIndexTab.PERFORMANCE;
                                divId = '#ordinary-tab-page';
                                break;
                            case 'preference-tab':
                                options.indexTab = MarketIndexTab.HISTORY;
                                divId = '#preference-tab-page';
                                break;
                            case 'us-denom-tab':
                                options.indexTab = MarketIndexTab.COMPOSITION;
                                divId = '#us-denom-tab-page';
                                break;
                        }
                        self.quoteView.changeTab(divId);

                    });

                    this.quoteView.model.fetch({success: success, error: error});
                },
                disclaimer: function() {
                    $(".jqm-navmenu-panel").panel("close");

                    $('.jqm-navmenu-panel #disclaimer-link').on('click', function(e) {
                        $(".jqm-navmenu-panel").panel("close");
                    });

                    $.mobile.loading("hide");
                    this.disclaimerView.render();
                },
                about: function() {
                    $(".jqm-navmenu-panel").panel("close");

                    $('.jqm-navmenu-panel #about-link').on('click', function(e) {
                        $(".jqm-navmenu-panel").panel("close");
                    });

                    $.mobile.loading("hide");
                    this.aboutView.render();
                }

            });

            // Returns the Router class
            return CategoryRouter;

        });