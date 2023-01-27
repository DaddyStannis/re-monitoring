from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from ReMonitoring.settings import REQUEST_DIR, BASE_DIR
from .services import *
from .TaskScanner import TaskScanner
from .Observer import startObserver, stopObserver


TASK_SCANNER = TaskScanner(REQUEST_DIR)
TASK_SCANNER.scan()
startObserver(TASK_SCANNER, REQUEST_DIR)


def getIndex(request):
  return render(request, 'index.html')


def getTasks(request):
  limit = int(request.GET.get('limit', -1))
  page = int(request.GET.get('page', 0))
  type_ = request.GET.get('type', 'alltypes')
  period = request.GET.get('period', 'alltime')
  newerFirst = int(request.GET.get('order', 1))
  onlyFailed = int(request.GET.get('status', 0))
  
  
  tasks, stat = TASK_SCANNER.getList(
    page * limit, 
    page * limit + limit, 
    type_=type_, 
    newerFirst=newerFirst, 
    onlyFailed=onlyFailed, 
    period=int(period) if period.isnumeric() else period
  )
  response = {
    'tasks': tasks,
    'generalInfo': TASK_SCANNER.getGeneralInfo(),
    'statistics': stat,
  }
  return JsonResponse(response, safe=False)  


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


def getJSServerApi(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/js/server-api.js', 'rb')
  return HttpResponse(file, content_type="text/javascript")


def getJSUtils(request):
  file = readFile(f'{BASE_DIR}/tasks/static/tasks/js/utils.js', 'rb')
  return HttpResponse(file, content_type="text/javascript")
