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
	words = []
	for line in sys.stdin:
		for word in line.replace('\n', '').split(','):
			words.append(word)
	argMap = getArgs()

	address = 'https://ghcap-web.herokuapp.com' if argMap.has_key('-r') else 'http://localhost:9000'
	
	requests.packages.urllib3.disable_warnings()
	socket = SocketIO(address + '/socket.io-client', verify=True)

	def after(result):
		print result

	socket.emit('misc:save common words', words, after)
	socket.wait_for_callbacks(seconds=20)
