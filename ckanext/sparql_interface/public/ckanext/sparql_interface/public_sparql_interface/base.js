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

    // On page load, check if a query hash is present in the URL
    var queryHash = getQueryHashFromURL();
    if (queryHash) {
        fetchSparqlQuery(queryHash);
    }


    // Open a new YASGUI tab with the provided query and set the tab name
    function openTabWithQuery(tabName, query) {
        editorCount++;
        const tabId = 'editor' + editorCount;

        $('#yasgui').empty(); // Clear the YASGUI container

        let yasgui = new Yasgui(document.getElementById('yasgui'), {
            requestConfig: { endpoint: "{{ h.sparql_endpoint_url() }}", endpointInput: false, method: "POST" },
            showControlBar: false
        });

        let tab = yasgui.addTab(true); // 'true' to activate the tab
        tab.setName(tabName); // Set the tab name
        tab.yasqe.setValue(query); // Set the SPARQL query

        editors[tabId] = { yasgui: yasgui };
        currentTabId = tabId;
        console.log(currentTabId);
    }

    // Helper function to get query hash from URL
    function getQueryHashFromURL() {
        var pathArray = window.location.pathname.split('/');
        var sparqlIndex = pathArray.indexOf('sparql');
        if (sparqlIndex !== -1 && pathArray.length > sparqlIndex + 1) {
            return pathArray[sparqlIndex + 1];
        }
        return null;
    }

    // Function to fetch SPARQL query using the query hash
    function fetchSparqlQuery(queryHash) {
        var url = '/sparql/' + queryHash;
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response) {
                if (response.error) {
                    showError(response.error);
                } else {
                       // Fetch the content from the textarea with id="fetched_hash_query_text"
                    var fetchedQueryText = $('#fetched_hash_query_text').val();
                    var shortQueryHash = queryHash.substring(0, 4);
                    // Use the fetched query text in the openTabWithQuery function
                    openTabWithQuery("Query " + shortQueryHash, fetchedQueryText);
                }
            },
            error: function(xhr, status, error) {
                showError('Error fetching query: ' + error);
            }
        });
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

    // Save the query to CKAN backend when the SaveQuery button is clicked
    $('#saveQuery').on('click', function (e) {
        e.preventDefault();
        saveQuery();
    });


    function saveQuery() {
    // Get the current SPARQL query
    let sparqlQuery = get_sparql_string();

    // Ensure a query exists
    if (!sparqlQuery) {
        showError("No SPARQL query to save.");
        return;
    }

    // Prepare the data for saving
    const saveData = {
        query: sparqlQuery
    };

    // Show loading spinner
    $('#loading_image').show();

    // Send the SPARQL query to CKAN backend for saving
    $.ajax({
        type: 'POST',
        url: '/sparql_interface/save', // Replace with your actual CKAN API URL for saving
        contentType: 'application/json',
        data: JSON.stringify(saveData),
        success: function (response) {
            $('#loading_image').hide();
            copyToClipboard(response.hash); // Copy the hash to the clipboard
            showCopiedTooltip(); // Show a tooltip to indicate that the hash is copied
        },
        error: function () {
            $('#loading_image').hide();
            showError("Error while saving the query.");
        }
    });
    }

    // Function to copy the hash to the clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Query hash copied to clipboard: ' + text);
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }

    // Function to show a small tooltip or message indicating that the hash is copied above the button
    function showCopiedTooltip() {
        let tooltip = $('<div class="copied-tooltip">Copied to clipboard!</div>');
        $('#saveQuery').after(tooltip); // Add the tooltip right after the button

        // Get the button position and dimensions
        let buttonOffset = $('#save-query-button').offset();
        let buttonWidth = $('#save-query-button').outerWidth();
        let buttonHeight = $('#save-query-button').outerHeight();

        // Style the tooltip with CSS to position it above the button
        $('.copied-tooltip').css({
            position: 'absolute',
            top: (buttonOffset.top - buttonHeight - 10) + 'px', // Position it above the button with 10px spacing
            left: (buttonOffset.left + buttonWidth / 2 - tooltip.outerWidth() / 2) + 'px', // Center it horizontally relative to the button
            padding: '5px 10px',
            background: 'green',
            color: 'white',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            opacity: 0, // Start hidden
            transition: 'opacity 0.3s ease'
        });

        // Show the tooltip
        $('.copied-tooltip').animate({ opacity: 1 }, 300);

        // Automatically hide the tooltip after 2 seconds
        setTimeout(function() {
            $('.copied-tooltip').fadeOut(500, function() {
                $(this).remove(); // Remove the element from the DOM
            });
        }, 2000); // Keep it visible for 2 seconds
    }

});
