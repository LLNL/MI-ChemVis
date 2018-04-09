from visPackage import *

# load the papers


#visualization components
visLayout = {
    "column":[{"row":["Summary", "Sentence", "Pipeline"]},
            {"row":["AttentionGraph", "AttentionMatrix", "Prediction"]}]
    }

#setup interface
modelVis = visModule(visLayout)
