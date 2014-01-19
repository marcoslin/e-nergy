#!/usr/bin/env python

import sys
import json
import httplib, urllib

http_hd = {
    "Authorization": "Basic YWRtaW46YWRtaW4=",
    "x-baasbox-appcode": "1234567890",
    "Content-Type": "application/json;charset=utf-8"
}


fh = open("charging-station_en_0.csv", "r")


number_rows = {"osm-id","version","latitudine","longitudine", "elapsed-time"}
headers = []
first_line = True

for line in fh:
    rows = line.split("\t")
    
    if first_line:
        for row in rows:
            headers.append(row.strip())
        first_line = False
        continue
    
    entry = {}
    row_count = 0
    for header in headers:
        entry_value = rows[row_count].strip()
        
        
        try:
            entry_value = entry_value.decode('utf-8', 'replace')
        except:
            print "### Error for %s with value %s" % (header, entry_value)
            entry_value = ""
        
        #print "header: %s; row: %s" % (header, entry_value)
        if header in number_rows:
            if entry_value == "":
                entry[header] = None
            else:
                entry[header] = float(entry_value)
        else:
            entry[header] = entry_value
        row_count += 1
        
    conn = httplib.HTTPConnection("localhost", 9000)
    conn.request("POST", "/document/station", json.dumps(entry), http_hd)
    #conn.request("GET", "/document/station")
    print "Response: %s" % conn.getresponse()
    