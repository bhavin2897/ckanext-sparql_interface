# encoding: utf-8

from flask import Blueprint, redirect, url_for, jsonify, render_template
from datetime import datetime
from ckan.plugins.toolkit import c, render, request
import ckan.lib.helpers as h
from ckanext.sparql_interface.utils import sparql_query_SPARQLWrapper as utils_sparqlQuery
from ckanext.sparql_interface.models.query_hash import SparqlQueryHash as sparql_db_table
from flask import Response
import hashlib
from logging import getLogger

logger = getLogger(__name__)

sparql = Blueprint(u'sparql_interface', __name__)


@sparql.route(u'/sparql')
def index():
    return render('sparql_interface/index.html')

@sparql.route(u'/sparql_interface')
def old_index():
    return h.redirect_to('sparql_interface.index')

@sparql.route(u'/query')
def old_query():

    return h.redirect_to('sparql_interface.query_page')
@sparql.route(u'/sparql_interface/query')
def query_page():
        respuesta=utils_sparqlQuery('')
        if isinstance(respuesta, Response) or request.params.get('direct_link')=='1':
            return respuesta
        else:
            return render('sparql_interface/query.html', extra_vars={'results':respuesta, 'direct_link':'0'})


#to save the query when "Save Query" button is clicked
@sparql.route(u'/sparql_interface/save', methods=['POST'])
def save_sparql_query():
    # Parse the incoming JSON request
    data = request.get_json()
    sparql_query = data.get('query')

    if not sparql_query:
        return jsonify({"error": "No SPARQL query provided"}), 400

    # Convert the SPARQL query to a short hash using SHA-256
    query_hash = hashlib.sha256(sparql_query.encode('utf-8')).hexdigest()[:32]
    url_query_hash = 'http://localhost:5000/sparql/' + query_hash
    timestamp = datetime.now()

    sparql_db_table.create(timestamp, sparql_query, query_hash )
    logger.info(f'sending it to Database')
    try:

        return jsonify({"hash": url_query_hash}), 200

    except Exception as e:
        # Handle any errors that occur during saving
        return jsonify({"error": str(e)}), 500


# Retrieve the SPARQL query from the database when URL hash is given
def retrieve_sparql_query(query_hash):
    #return h.redirect_to('sparql_interface.index')
    try:
        # Retrieve the record from the database using the query hash
        sparql_record = sparql_db_table.get_hash_format(query_hash_format=query_hash)

        # Check if the record exists
        if not sparql_record:
            return jsonify({"error": "No record found with the provided hash"}), 404

        # Return the data in the response
        return sparql_record

    except Exception as e:
        # Handle any errors that occur during retrieval
        return jsonify({"error": str(e)}), 500

@sparql.route(u'/sparql/<query_hash>', methods=['GET'])
def retrieve_sparql_query_template(query_hash):
    sparql_record_json = retrieve_sparql_query(query_hash)
    logger.debug(f"{sparql_record_json}")
    return render_template('sparql_interface/snippets/hash_query.html', query_hash=sparql_record_json)


