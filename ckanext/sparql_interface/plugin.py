import ckanext.sparql_interface.helpers as sparql_helpers
from logging import getLogger
from ckanext.sparql_interface import blueprint
from ckan.lib.plugins import DefaultTranslation
import ckan.plugins as p
import collections
import csv

log = getLogger(__name__)


class SparqlInterfacePlugin(p.SingletonPlugin, DefaultTranslation):
    '''Sparql plugin.'''

    p.implements(p.IBlueprint)
    p.implements(p.IConfigurer, inherit=True)
    p.implements(p.ITemplateHelpers, inherit=True)
    p.implements(p.ITranslation)

    def get_blueprint(self):
        return blueprint.sparql

    def update_config(self, config):
        p.toolkit.add_template_directory(config, 'templates')
        p.toolkit.add_public_directory(config, 'public/ckanext/sparql_interface')
        p.toolkit.add_resource('public/ckanext/sparql_interface', 'ckanext_sparql_interface')

    ## TEMPLATE FUNCTIONS ##

    def get_helpers(self):
        # logger.debug('Getting helpers...')

        response = dict(sparql_helpers.all_helpers)
        log.debug(f'response: {response}')
        return response
