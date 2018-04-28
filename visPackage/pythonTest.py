from aggregator import *
import json

with open("../papers.json") as json_data:
    papers = json.load(json_data)
    print "load json: ", len(papers)
    ag = aggregator(papers)
    ag.generateAllTags()
    ag.tagAutocomplete("ma")
