import json
import re
import time
from datetime import datetime
from .Utils import FileSystem, Path


def getJsonInHtmlFormat(text):
    text = json.dumps(json.loads(text), indent=4)
    text = re.sub(r'\n', r'<br>', text)
    text = re.sub(r' ', r'&nbsp', text)
    return text


def sortByDate(taskList: list, reverse=False):
    taskList.sort(key=lambda task: task.timestamp, reverse=reverse)


def countProcessedTasks(taskList: list):
    processedTasks = [pt for pt in taskList if pt.status == 'Processed']
    return len(processedTasks)


def countFailedTasks(taskList: list):
    processedTasks = [pt for pt in taskList if pt.status == 'Failed']
    return len(processedTasks)


def filterTasksByPeriod(taskList: list, seconds: float):
    filteredTasks = []
    for t in taskList:
        epochTime = time.time()
        if t.timestamp + seconds >= epochTime:
            filteredTasks.append(t)
    return filteredTasks


class TaskFile:

    def __init__(self, requestDir):
        self._requestDir = requestDir
        print(requestDir)

    def getList(self, onlyFailed=True):
        types = self.getRequestTypes()
        
        tasks = []
        for t in types:
            tasks += self.getListByType(t, onlyFailed)

        return tasks

    def getListByType(self, type_, onlyFailed=True):
        servers = self._getServersFromType(type_)
        tasks = []

        for s in servers:
            if onlyFailed:
                failedTasks = self._getFailedTasksFromServer(type_, s)
                processedTasks = self._getProcessedTasksFromServer(type_, s)

                self._excludeFromFailedIfTaskInProcessed(failedTasks, processedTasks)

                tasks += failedTasks
            else:
                tasks += self._getAllTasksFromServer(type_, s)
                
        return tasks

    def getFileContent(self, type_, server, status, filename):
        path = Path.appendDirsToPath(self._requestDir, (type_, server, status))
        path = Path.appendFileToPath(path, filename)
        return self._getFileContentOrErrorMessage(path)

    def getRequestTypes(self):
        return FileSystem.getDirs(self._requestDir)

    def _getServersFromType(self, type_):
        dirPath = Path.appendDirToPath(self._requestDir, type_)
        return FileSystem.getDirs(dirPath)

    def _getAllTasksFromServer(self, type_, server):
        failedTasks = self._getFailedTasksFromServer(type_, server)
        processedTasks = self._getProcessedTasksFromServer(type_, server)

        self._excludeFromFailedIfTaskInProcessed(failedTasks, processedTasks)
    
        return failedTasks + processedTasks
    
    def _excludeFromFailedIfTaskInProcessed(self, failedTasks: list, processedTasks: list):
        '''
        Should only be called when comparing tasks from the same server,
        because tasks on different servers can have the same ID.
        '''
        for ft in failedTasks.copy():
            for pt in processedTasks.copy():
                if ft['id'] == pt['id'] and ft in failedTasks:
                    failedTasks.remove(ft)

    def _getFailedTasksFromServer(self, type_, server):
        return self._getTasksFromServerByStatus(type_, server, 'Failed')

    def _getProcessedTasksFromServer(self, type_, server):
        return self._getTasksFromServerByStatus(type_, server, 'Processed')

    def _getTasksFromServerByStatus(self, type_, server, status):
        dirPath = Path.appendDirsToPath(self._requestDir, (type_, server, status))
        
        if not FileSystem.isDir(dirPath):
            return []
            
        files = FileSystem.getFiles(dirPath)

        tasks = []
        for fileName in files:
            filePath = Path.appendFileToPath(dirPath, fileName)

            struct = self._getStructIfTaskOrNone(filePath)
            
            if struct:
                tasks.append(struct)

        return tasks

    def _getStructIfTaskOrNone(self, path):
        task = {}

        partsOfPath = str.split(path, '/')
        filename = partsOfPath[-1]
        status = partsOfPath[-2]
        server = partsOfPath[-3]
        type_ = partsOfPath[-4]

        if not str.endswith(filename, '.json'):
            return None

        file = FileSystem.getFile(path)
            
        try:
            data = json.loads(file)
            
            task['originalJson'] = getJsonInHtmlFormat(file)
            task['type'] = type_
            task['server'] = server
            task['filename'] = filename
            task['timestamp'] = FileSystem.getFileModifiedTime(path)
            task['status'] = status

            if 'id' in data:
                task['id'] = data['id']
            else:
                task['id'] = 'id field is missing'

            if status == 'Failed':
                task['failureReason'] = self._getReasonFile(path)
                
            return task

        except json.JSONDecodeError as e:
            print(e)
        
        return None

    def _getReasonFile(self, pathToJsonFile):
        path = re.sub(r'.json$', '.reason', pathToJsonFile)
        return self._getFileContentOrErrorMessage(path)
        
    def _getFileContentOrErrorMessage(self, path):
        if not FileSystem.isFile(path):
            errorMsg = f'File "{path}" - doesn\'t exist'
            print(errorMsg)
            return errorMsg

        return FileSystem.getFile(path)
