Fata sentiment site.


Requirements
------------
- ndistro (http://github.com/visionmedia/ndistro)
- mongodb (http://www.mongodb.org)


Install & Run
-------------

    $ git clone git@github.com:developmentseed/fata.git
    $ cd fata
    $ ndistro
    $ mongoimport --drop --type csv --db fata --collection responses --ignoreBlanks --headerline resources/fata_variables.csv
    $ ./app
