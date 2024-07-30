# encoding: utf-8

from flask import Blueprint, redirect, url_for

from ckan.plugins.toolkit import c, render, request
import ckan.lib.helpers as h
from ckanext.sparql_interface.utils import sparqlQuery as utils_sparqlQuery
from flask import Response

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
