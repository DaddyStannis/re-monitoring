import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound
from ReMonitoring.settings import REQUEST_DIR, BASE_DIR
from .services import *
from .File import TaskFile


def getIndex(request):
  return render(request, 'index.html')

def getTasks(request):
  taskFile = TaskFile(REQUEST_DIR)
  taskList = taskFile.getList()
  return HttpResponse(json.dumps(taskList), content_type="application/json")

def getIcons(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/img/icons.svg', 'rb')
  return HttpResponse(file, content_type="text/xml")

def getStyles(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/css/styles.css', 'rb')
  return HttpResponse(file, content_type="text/css")

def getNormalizer(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/css/normalize.css', 'rb')
  return HttpResponse(file, content_type="text/css")

def getJSModal(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/js/modal.js', 'rb')
  return HttpResponse(file, content_type="text/javascript")

def getJSMain(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/js/main.js', 'rb')
  return HttpResponse(file, content_type="text/javascript")
