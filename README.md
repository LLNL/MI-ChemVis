# ChemVis 

## Intro
 - A visual analytics system for the material informatics project

## Setup

### 1. Install
 - install dependency:
   `pip install -r requirements.txt`

### 2. Run the visualization server
 - Start the server:  
   `python runServer.py`
 - Then open the browser at http://localhost:5010/

## Docker Setup

### 1. Install
 - Install Docker
 - If OSX/Linux: run "./docker\_build.sh" without the quotes. If Windows, run the last line in docker\_build.sh

### 2. Run the visualization server
 - Similarily, if OSX/Linux: run "./docker\_run.sh" without the quotes. If Windows, run last line in docker\_run.sh. 
 - In a browser, go to the url 0.0.0.0:5010 (Use Chrome for the fastest performance)

## Note
It may take a minute to load with the included dataset. 
