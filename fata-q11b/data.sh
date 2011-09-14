#!/bin/bash
question=Q11b

rm layers/$question.sqlite
curl http://developmentseed.org/fata/csv/$question.csv > layers/$question.csv && \
echo -e "CREATE TABLE data (agency varchar(255) not null, positive integer(4), positive_pct real, negative integer(4), negative_pct real);\n.mode csv\n.import 'layers/$question.csv' data" | sqlite3 layers/$question.sqlite
