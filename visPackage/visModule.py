
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format
'''

from flask import Flask, Response, request, send_from_directory
import socketio
import eventlet
from socketioManager import *
from aggregator import *
import webbrowser, threading
import time
import json
# import networkx as nx
# from fa2 import ForceAtlas2

app = Flask(__name__)
sio = socketio.Server()
fApp = socketio.Middleware(sio, app)
dataManager = socketioManager(sio)

###### FIXME rewrite the base class to separate route code with class code #######
#################### server control ######################
class visModule:
    def __init__(self):
        dataManager.setObject(self)

    # envoke callback when the server is running
    @sio.on('message', namespace='/app')
    def parsingMessage(sid, msg):
        # print sid, msg
        return dataManager.receiveFromClient(msg)

    def show(self):
        url = 'http://localhost:5050'
        threading.Timer(1.5, lambda: webbrowser.open(url, new=0) ).start()
        #
        eventlet.wsgi.server(eventlet.listen(('localhost', 5010)), fApp)

    # @staticmethod
    def startServer(self, port):
        eventlet.wsgi.server(eventlet.listen(('0.0.0.0', port)), fApp)
        # socketio.run(app, host='localhost',port=5050, debug=True)

############## specialized vis modules ################

'''
data organization structure
    - fullPaperList (list of all paper)
    - paperList (list of all paper)
    - selection (current select list of paper)
    - allSeletions (all selections set)
'''

layoutConfig = None
aggregate = None
tagArray = None

class chemVisModule(visModule):
    def __init__(self, componentLayout, database):
        self.database = database
        # super(visModule, self).__init__()
        self.index = 0
        global layoutConfig
        layoutConfig = componentLayout
        dataManager.setObject(self)


    @app.route('/')
    def index():
        global tagArray
        dataManager.clear()
        selectionTag = request.args.get('select', '')
        # print "selectionTag:", selectionTag
        dataManager.setData("componentLayout", layoutConfig)
        tagArray = []
        if selectionTag:
            tagArray.append(selectionTag.split(":"))
        print "tagArray:", tagArray
        dataManager.setData("selection", [])
        dataManager.setData("highlight", [])
        return app.send_static_file('index.html')

    @app.route('/images/<path>/<filename>')
    def sendImage(path, filename):
        print path, filename
        # return send_from_directory('images', path)
        return app.send_static_file('images/'+path+"/"+filename)


    @app.route('/<name>')
    def views(name):
        return app.send_static_file('viewTemplates/'+name)

    @app.route('/autocomplete', methods=['GET'])
    def autocomplete():
        term = request.args['term']
        print term
        # return app.send_static_file('autocomplete.html')
        autocompleteList = aggregate.tagAutocomplete(term)
        return Response(json.dumps(autocompleteList[0:20]), mimetype='application/json')

    ########### all function should have a return value ############
    ############# list of other API #############

    def loadData(self):
        global tagArray
        print "\n\nbefore load file:", self.database
        try:
            with open(self.database) as json_data:
                global aggregate
                papers = json.load(json_data)
                print "load json: ", self.database, len(papers)
                # papers = papers[0:500]
                papers = papers[0:2040]
                dataManager.setData("paperList", papers)

                print "aggregate paper"
                self.aggregator = aggregator(papers)
                aggregate = self.aggregator

                print "pre-selection:", tagArray
                if tagArray:
                    self.selectionByTags(tagArray)
                return True
        except IOError as e:
            print 'File loading error!!:', e
            return False


    def aggregateLabelsByKeys(self, selection, keys):
        print "keys:", keys
        return {
            "aggregation":self.aggregator.aggregateLabelsByKeys(selection, keys),
            "keys": keys
            };

    def aggregateValuesByKeys(self, selection, keysX, keysY):
        return {
            "aggregation":self.aggregator.aggregateValuesByKeys(selection, keysX, keysY),
            "keysX": keysX,
            "keysY": keysY
            };

    def addTagToSelection(self, selectionType, tag):
        ### type determine what kind of selection label
        print "selectionType:", selectionType
        print "tag:", tag

        return True

    def highlightByTags(self, tags):
        print "highlightByTags", tags
        group = None
        selection = dataManager.getData("selection")
        for tag in tags:
            if group == None:
                group = set(self.aggregator.groupByKeys(selection,tag))
            else:
                group.intersection_update(self.aggregator.groupByKeys([],tag))

        # print group
        if group:
            dataManager.setData("highlight", list(group))
        else:
            ## un-highlight
            dataManager.setData("highlight", [])
        return True

    def selectionByTags(self, tags):
        tagArray = tags
        print "selectionByTags", tags
        group = None
        for tag in tags:
            if group == None:
                group = set(self.aggregator.groupByKeys([],tag))
            else:
                group.intersection_update(self.aggregator.groupByKeys([],tag))

        # print group
        if group:
            dataManager.setData("selection", list(group))
        else:
            ## un-highlight
            dataManager.setData("selection", [])
        return True

    def selectPaperByIndex(self, index):
        dataManager.setData("paper", dataManager.getData("paperList")[index])
        return True

##### experimental code for server graph layout #####
'''
    def layoutGraph(self, links, pos = None):
        ## graph is a list of edges ##
        # print "links:", links

        G = nx.Graph()
        G.add_edges_from(links)
        # print G

        #### layout the graph ####
        forceatlas2 = ForceAtlas2(
                      # Behavior alternatives
                      outboundAttractionDistribution=True,  # Dissuade hubs
                      linLogMode=False,  # NOT IMPLEMENTED
                      adjustSizes=False,  # Prevent overlap (NOT IMPLEMENTED)
                      edgeWeightInfluence=0.5,
                      # Performance
                      jitterTolerance=1.0,  # Tolerance
                      barnesHutOptimize=True,
                      barnesHutTheta=1.2,
                      multiThreaded=False,  # NOT IMPLEMENTED

                      # Tuning
                      scalingRatio=2.0,
                      strongGravityMode=False,
                      gravity=0.2,

                      # Log
                      verbose=True)

        positions = forceatlas2.forceatlas2_networkx_layout(G, pos=pos, iterations=1500)
        # pos = []
        # print positions
        # for item in positions.items():
            # pos.append(item[1])
        # return pos
        return positions
'''


    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    ### !!!! this is not called curretnly !!!! ####
