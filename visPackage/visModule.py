
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

        # deploy as an eventlet WSGI server
        # sio.start_background_task(self.startServer)

    # @staticmethod
    def startServer(self):
        eventlet.wsgi.server(eventlet.listen(('localhost', 5010)), fApp)
        # socketio.run(app, host='localhost',port=5050, debug=True)

############## specialized vis modules ################

'''
data organization structure
    - paperList (list of all paper)
'''

layoutConfig = None

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
        # dataManager.setData("sentenceList", exampleData)
        # dataManager.setData("pipeline", pipelineState)
        # dataManager.setData("currentPair", {"sentences":[exampleData[0]['src'], exampleData[0]['targ']],"label":exampleData[0]['pred']})
        return app.send_static_file('index.html')

    @app.route('/<name>')
    def views(name):
        return {
            'template_view': app.send_static_file('viewTemplates/template_view.mst'),
            'doc_view': app.send_static_file('viewTemplates/doc_view.mst'),
            'filter_view': app.send_static_file('viewTemplates/filter_view.mst'),
            'graph_view': app.send_static_file('viewTemplates/graph_view.mst')
        }.get(name)

    def loadData(self, filename):
        with open(filename) as json_data:
            papers = json.load(json_data)
            print "load json: ", filename, len(papers)
            dataManager.setData("paperList", papers)
            return True


    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    ### !!!! this is not called curretnly !!!! ####
