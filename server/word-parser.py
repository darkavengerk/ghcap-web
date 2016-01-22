import pysrt
from nltk.corpus import wordnet as wn
from nltk.tokenize import word_tokenize as wt
import requests
from socketIO_client import SocketIO

from Tkinter import Tk
from tkFileDialog import askopenfilename

import sys, getopt

def getArgs():
	argv = sys.argv[1:];
	inputfile = ''
	outputfile = ''
	opts, args = getopt.getopt(argv,"heri:o:",["ifile=","ofile="])
	optMap = {};
	for opt, arg in opts:
		optMap[opt] = arg
	return optMap


def after(result):
	print result

def morphy(word):
	return wn.morphy(word, wn.VERB) or wn.morphy(word, wn.NOUN) or wn.morphy(word)

def tokenize(source):
	words = wt(source.lower().replace("can't", "can").replace("won't", "will").replace("gonna", "go"))
	words = filter(lambda x:x.isalpha() and len(x) > 1, words)
	reformed = map(lambda x: (morphy(x) or x), words)
	made = []
	count = len(reformed)
	for word in reformed:
		if word not in made:
			made.append(word)
	return made, count

def milliseconds(time_object):
	return (((time_object.hours * 60) + time_object.minutes) * 60 + time_object.seconds) * 1000 + time_object.milliseconds;

def subtitle_processer(subtitle):
	info_map = {}
	info_map['text'] = subtitle.text
	info_map['start'] = str(subtitle.start)
	info_map['end'] = str(subtitle.end)
	info_map['duration'] = milliseconds(subtitle.end) - milliseconds(subtitle.start)
	info_map['words'], info_map['count'] = tokenize(subtitle.text)
	return info_map


if __name__ == "__main__":
	argMap = getArgs()

	Tk().withdraw() # we don't want a full GUI, so keep the root window from appearing
	filename = askopenfilename() # show an "Open" dialog box and return the path to the selected file

	if argMap.has_key('-e'):
		print 'e'
		subs = pysrt.open(filename or 'test.srt', encoding='iso-8859-1')
	else:
		print 'not e'
		subs = pysrt.open(filename or 'test.srt')#, encoding='iso-8859-1')

	address = 'https://ghcap-web.herokuapp.com' if argMap.has_key('-r') else 'http://localhost:9000'
	print address
	
	requests.packages.urllib3.disable_warnings()
	socket = SocketIO(address + '/socket.io-client', verify=True)

	title = raw_input('Input title: ')
	socket.emit('data:save', {'title': title, 'type':'sub', 'raw':map(lambda x: subtitle_processer(x), subs)}, after)
	stop = raw_input('Done?')


