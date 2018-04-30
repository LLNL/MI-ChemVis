
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format
'''

from flask import Flask, Response, request
import socketio
import eventlet
from socketioManager import *
from aggregator import *
import webbrowser, threading
import time
import json

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
    def startServer(self):
        eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5010)), fApp)
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

class chemVisModule(visModule):
    def __init__(self, componentLayout):
        # super(visModule, self).__init__()
        self.index = 0
        global layoutConfig
        layoutConfig = componentLayout
        dataManager.setObject(self)

    @app.route('/')
    def index():
        dataManager.clear()
        dataManager.setData("componentLayout", layoutConfig)
        dataManager.setData("selection", [])
        dataManager.setData("highlight", [])
        return app.send_static_file('index.html')

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
    def loadData(self, filename):
        with open(filename) as json_data:
            global aggregate
            papers = json.load(json_data)
            print "load json: ", filename, len(papers)
            dataManager.setData("paperList", papers)

            self.aggregator = aggregator(papers)
            aggregate = self.aggregator
            return True


    def aggregateLabelsByKeys(self, selection, keys):
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

        print group
        if group:
            dataManager.setData("highlight", list(group))
        else:
            ## un-highlight
            dataManager.setData("highlight", [])
        return True

    def selectionByTags(self, tags):
        print "selectionByTags", tags
        group = None
        for tag in tags:
            if group == None:
                group = set(self.aggregator.groupByKeys([],tag))
            else:
                group.intersection_update(self.aggregator.groupByKeys([],tag))

        print group
        if group:
            dataManager.setData("selection", list(group))
        else:
            ## un-highlight
            dataManager.setData("selection", [])
        return True

    ############# list of other API #############



    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    ### !!!! this is not called curretnly !!!! ####
