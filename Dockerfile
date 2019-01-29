FROM python:2.7

ADD ./requirements.txt /requirements.txt 
RUN pip install -r /requirements.txt

COPY ./ /code/

WORKDIR /code
CMD python runServer.py
