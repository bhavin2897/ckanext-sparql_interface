# CKAN Sparql Interface Extension

Note: The ``ckanext-sparql_interface`` extension was tested using ``Virtuoso sparql instances`` such as http://dbpedia.org/sparql
and http://datos.gob.es/virtuoso/sparql

- **Version:** 2.0
- **Status:** Development
- **CKAN Version:** >= 2.9

This version has been evolved from the original 1.01, to made it work with ckan 2.8 and python 3.9

## Description

This is a simple extension, but may be useful for someone that wants to include a Sparql Interface Editor in their CKAN instances. 
The idea is based on the [Sparql Editor of the LODUM project from the University of Munsters Open Data initiative](http://data.uni-muenster.de/php/sparql/).

## Requeriments
The extension use:

- [`CodeMirror`](http://codemirror.net/) for the code editor in the browser.

- May be extended to use [`SPARQLWrapper`](http://sparql-wrapper.sourceforge.net/) library - SPARQL Endpoint interface to Python

## Installation

To install ckanext-sparql_interface:

1. Activate your CKAN virtual environment, for example:

     `. /usr/lib/ckan/default/bin/activate`

2. Clone the source and install it on the virtualenv

    ```
    git clone https://github.com/OpenDataGIS/ckanext-sparql_interface.git
    cd ckanext-sparql_interface
    pip install -e .
	pip install -r requirements.txt
    ```

3. Add `sparql_interface` to the `ckan.plugins` setting in your CKAN
   config file (by default the config file is located at
   `/etc/ckan/default/ckan.ini`).
   
4. In order to let the English and other languajes profiles work, it is 
   absolutely mandatory to make the directory `/ckan/ckan/public/base/i18n`
   writable by the ckan user. CKAN WILL NOT START IF YOU DON'T DO SO!
   
5. Add configuration to the CKAN configuration file as required. See below.
   
6. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu:

     `sudo service apache2 reload`
  
## Configuration

In your ``ckan.ini`` file set 
```ini
	ckanext.sparql_interface.endpoint_url = <your default endpoint url>    (defaults to http://dbpedia.org/sparql)
	ckanext.sparql_interface.hide_endpoint_url = (true | false)    (defaults to false)
```
  
## Use
Go to:

    http://[Custom URL]/sparql_interface/

Querys work in:

	http://[Custom URL]/sparql_interface/query?query=

To send code through ``http`` to the sparql interface:

	http://[Custom URL]/sparql_interface/index?view_code=

## Notes

To configure your own custom example query in [`templates/sparql_interface/index.html`](ckanext/sparql_interface/templates/sparql_interface/index.html) template 

```html
	<!-- Line 57, After-->
	<textarea id="sparql_code" name="sparql_code"  resize="both">
	<!-- Here replace the query-->
	    ...
	</textarea>
```

To change the default prefixes, edit `prefixes` in [`public/ckanext/sparql_interface/public_sparql_interface/base.js`](ckanext/sparql_interface/public/ckanext/sparql_interface/public_sparql_interface/base.js)
```js
var prefixes = "PREFIX void: <http://rdfs.org/ns/void#> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX vann: <http://purl.org/vocab/vann/> PREFIX teach: <http://linkedscience.org/teach/ns#>"
```

  
## Changelog

- Version: 1.01: Fix Bugs 
- Version: 2.0: Adapted to ckan 2.9 and internacionalized
- Version: 2.0.1: Minor fixes

Example
=======

- http://data.upf.edu/sparql


ToDos
=====

* externalize configuration of default query
