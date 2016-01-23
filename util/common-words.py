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


if __name__ == "__main__":
	argMap = getArgs()


	# if argMap.has_key('-e'):
	# 	print 'e'
	# 	subs = pysrt.open(filename or 'test.srt', encoding='iso-8859-1')
	# else:
	# 	print 'not e'
	# 	subs = pysrt.open(filename or 'test.srt')#, encoding='iso-8859-1')

	address = 'https://ghcap-web.herokuapp.com' if argMap.has_key('-r') else 'http://localhost:9000'
	# print address
	
	requests.packages.urllib3.disable_warnings()
	socket = SocketIO(address + '/socket.io-client', verify=True)
	mediaList = []

	def after(result):
		mediaList = map(lambda x:x['population'], result)
		words = []
		for media in mediaList:
			filteredWords = filter(lambda x: x[1] > 2, media)
			words.append(filteredWords)
		wordRecords = {}
		maxLength = len(words)
		for wordList in words:
			for word in wordList:
				target = word[0]
				if not wordRecords.has_key(target):
					wordRecords[target] = 0;
				wordRecords[target] += 1
		found = []
		for word in wordRecords:
			if wordRecords[word] == maxLength:
				found.append(word)
				print word
		# print ','.join(found)

	socket.emit('media:get', {}, after)
	socket.wait_for_callbacks(seconds=20)
