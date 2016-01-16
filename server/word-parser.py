import pysrt
from nltk.corpus import wordnet as wn
from nltk.tokenize import word_tokenize as wt
import requests
from socketIO_client import SocketIO

from Tkinter import Tk
from tkFileDialog import askopenfilename

Tk().withdraw() # we don't want a full GUI, so keep the root window from appearing
filename = askopenfilename() # show an "Open" dialog box and return the path to the selected file

subs = pysrt.open(filename)

def morphy(word):
	return wn.morphy(word, wn.VERB) or wn.morphy(word, wn.NOUN) or wn.morphy(word)

def tokenize(source):
	words = wt(source.lower().replace("can't", "can not").replace("won't", "will not").replace("gonna", "going to"))
	words = filter(lambda x:x.isalpha() and len(x) > 1, words)
	reformed = map(lambda x: (morphy(x) or x), words)
	made = []
	for word in reformed:
		if word not in made:
			made.append(word)
	return made

def milliseconds(time_object):
	return (((time_object.hours * 60) + time_object.minutes) * 60 + time_object.seconds) * 1000 + time_object.milliseconds;

def subtitle_processer(subtitle):
	info_map = {}
	info_map['text'] = subtitle.text
	info_map['time'] = str(subtitle.start) + ' --> ' + str(subtitle.end)
	info_map['duration'] = milliseconds(subtitle.end) - milliseconds(subtitle.start)
	info_map['words'] = tokenize(subtitle.text)
	return info_map

socket = SocketIO('http://localhost:9000/socket.io-client', verify=False)

socket.emit('data:save', {'title': filename, 'raw':map(lambda x: subtitle_processer(x), subs)})