# Materials Informatics ChemVis (MICV) 

## Intro
 - A visual analytics system for the material informatics project

You can install this by installing python and installing the dependencies, or through Docker, which may be simpler.

Click on a dot in the lower left "Graph" section to start exploring.

## Setup

### 1. Install
 - Have python and pip installed
 - install dependency:
   `pip install -r requirements.txt`

### 2. Run the visualization server
 - Start the server:  
   `python runServer.py`
     - The default dataset is 35k.json. For others, run with `python runServer.py --input FILE.json`, where you substitute FILE.json. See the "Visualization Data" section for other input files.
 - Then open a browser at http://localhost:5010/ (in Chrome for the fastest performance)

## Setup with Docker

### 1. Install
 - Install Docker
 - If OSX/Linux: run "./docker\_build.sh" without the quotes. If Windows, run the last line in docker\_build.sh

### 2. Run the visualization server
 - Similarily, if OSX/Linux: run "./docker\_run.sh" without the quotes. If Windows, run last line in docker\_run.sh. 
     - Run "./docker\_run.sh FILE.json" to chose another dataset besides the 35k dataset. See the regular Setup section for more details.
 - Then open a browser at http://localhost:5010/ (in Chrome for the fastest performance)


## Visualization Data

  - 35k.json is data from our pipeline applied to the 35k papers downloaded from Elsevier.

  - 99.json is data from our pipeline applied to the 99 gold standard papers. The experimental sentence extraction step was substituted with the SME's annotated experimental sentence annotations.

  - gold\_normalized.json is the chemical annotations from SMEs, normalized with our pipeline. 

## Gold Standard Data

Gold data is contained in the gold\_data folder. 
The materials\_informatics\_gold\_es\_and\_chems folder contains txt files containing the experimental sections of 99 gold standard papers, and ann files containing Brat formatted annotations of chemical entities. 
The gold\_standard.json file contains the information of the materials\_informatics\_gold\_es\_and\_chems files, as well as the morphology and composition annotation of the papers. 
These annotations are from subject matter experts. 

## Release
Release number LLNL-CODE-780105
ChemVis is distrubted under the MIT license.
