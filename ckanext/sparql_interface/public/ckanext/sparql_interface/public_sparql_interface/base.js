var $ = jQuery.noConflict();

$(document).ready(function () {
    var editorCount = 0;
    var editors = {};
    var currentTabId = null;
    var prefixes = "PREFIX void: <http://rdfs.org/ns/void#> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX dcat: <http://www.w3.org/ns/dcat#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";

    $('#sparql_results, #sparql_link_query, #loading_image').hide();

    // Event listeners for button clicks
    $('#title_with_inchi').on('click', function (e) {
        e.preventDefault();
        openTabWithQuery("Title & Description", $('#title_with_inchi_text').val());
    });

    $('#fed_query_wiki_data').on('click', function (e) {
        e.preventDefault();
        openTabWithQuery("Federated Query with Wiki Data", $('#fed_query_wiki_data_text').val());
    });

    $('#nr_of_datasets').on('click', function (e) {
        e.preventDefault();
        openTabWithQuery("Number of Datasets", $('#nr_of_datasets_text').val());
    });

    // Open a new YASGUI tab with the provided query and set the tab name
    function openTabWithQuery(tabName, query) {
        editorCount++;
        const tabId = 'editor' + editorCount;

        $('#yasgui').empty(); // Clear the YASGUI container

        let yasgui = new Yasgui(document.getElementById('yasgui'), {
            requestConfig: { endpoint: 'http://sparql21.service.tib.eu/fuseki/NFDI4Chem/query', endpointInput: false, method: "POST" },
            showControlBar: false
        });

        let tab = yasgui.addTab(true); // 'true' to activate the tab
        tab.setName(tabName); // Set the tab name
        tab.yasqe.setValue(query); // Set the SPARQL query

        editors[tabId] = { yasgui: yasgui };
        currentTabId = tabId;
    }

    // Function to call the SPARQL server and display results
    function call_sparql_point_server() {
        if ($("#field-sparql-server").val().length === 0) {
            showError("Please add the Sparql Point Server URL.");
            return;
        }

        $('#sparql_results').hide();
        $('#loading_image').show();

        $.ajax({
            type: 'GET',
            url: 'sparql_interface/query',
            data: {
                'query': prefixes + get_sparql_string(),
                'server': $("#field-sparql-server").val(),
                'direct_link': 0
            },
            success: function (response) {
                displayResults(response);
            },
            error: function () {
                showError("Please verify your query.");
            }
        });
    }

    // Display SPARQL query results
    function displayResults(response) {
        $('#sparql_results').html(response);
        let baseAddress = queryHref() + '/' + change_direct_link_value(this.url);

        $('#sparql_results, #sparql_link_query').show();
        $('#loading_image').hide();
    }

    // Get the current SPARQL query
    function get_sparql_string() {
        return editors[currentTabId].yasgui.getTab().yasqe.getValue();
    }

    // Utility functions
    function showError(message) {
        $('#loading_image').hide();
        $('#sparql_results').show().html(`<div class='alert alert-error'><strong>Error: </strong>${message}</div>`);
    }

    function change_direct_link_value(url) {
        return url.slice(0, -1) + '1';
    }

    function queryHref() {
        let pathArray = window.location.pathname.split("/");
        return window.location.origin + pathArray.slice(0, -1).join("/");
    }
});
