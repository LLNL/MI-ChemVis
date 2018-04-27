
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format
'''

from flask import Flask
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

class chemVisModule(visModule):
    def __init__(self, componentLayout):
        # super(visModule, self).__init__()
        self.index = 0
        global layoutConfig
        layoutConfig = componentLayout
        dataManager.setObject(self)
        self.aggregator = None

    @app.route('/')
    def index():
        dataManager.clear()
        dataManager.setData("componentLayout", layoutConfig)
        return app.send_static_file('index.html')

    @app.route('/<name>')
    def views(name):
        return app.send_static_file('viewTemplates/'+name)

    ########### all function should have a return value ############
    def loadData(self, filename):
        with open(filename) as json_data:
            papers = json.load(json_data)
            print "load json: ", filename, len(papers)
            dataManager.setData("paperList", papers)

            self.aggregator = aggregator(papers)
            return True


    def aggregateLabelsByKeys(self, selection, keys):
        return {
            "aggregation":self.aggregator.aggregateByKeys(selection, keys),
            "keys": keys
            };

    def aggregateValuesByKeys(self, selection, keys):
        return {
            "aggregation":self.aggregator.aggregateValuesByKeys(selection, keys),
            "keys": keys
            };

    def addTagToSelection(self, type, tag):
        pass
        return True

    def highlightByTag(self, tag):

        return True
    ############# list of other API #############



    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    ### !!!! this is not called curretnly !!!! ####
