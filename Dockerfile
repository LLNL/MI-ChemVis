FROM python:2.7

ADD ./requirements.txt /requirements.txt 
RUN pip install -r /requirements.txt

# Volume containing code mounted at
COPY . /code
WORKDIR /code
CMD python runServer.py
