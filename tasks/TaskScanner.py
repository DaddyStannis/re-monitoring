import time
from threading import Lock
from .Utils import *


class TaskScanner:

    def __init__(self, requestDir):
        self._lock = Lock()
        self._tasks = []
        self._requestDir = requestDir
        self._generalInfo = {
            'total': 0,
            'failed': 0,
            'processed': 0,
            'types': [],
        }
        print(requestDir)
        
    def scan(self):
        with self._lock:
            types = self.getTypes()
            
            for t in types:
                self._scanByType(t)

    def getList(self, from_=0, to=-1, type_='alltypes', newerFirst=True, onlyFailed=True, period='alltime'):
        tasks = []
        with self._lock:
            timeNow = time.time()
        
            for task in self._tasks:
                if onlyFailed and task['status'] != 'Failed':
                    continue
                if type_ != 'alltypes' and task['type'] != type_:
                    continue
                if period != 'alltime' and (task['timestamp'] + period) <= timeNow:
                    continue
                tasks.append(task)
                
        TaskScanner.sortByDate(tasks, newerFirst)
        return tasks[from_:to], TaskScanner.getStat(tasks)
        
    def getGeneralInfo(self):
        return self._generalInfo
    
    @staticmethod
    def getStat(tasks):
        return {
            'total': len(tasks),
            'failed': TaskScanner.countFailedTasks(tasks),
            'processed': TaskScanner.countProcessedTasks(tasks),
        }
        
    @staticmethod
    def sortByDate(tasks, reverse=False):
        tasks.sort(key=lambda task: task['timestamp'], reverse=reverse)

    @staticmethod
    def countProcessedTasks(tasks):
        return TaskScanner.countTasksByStatus(tasks, 'Processed')

    @staticmethod
    def countFailedTasks(tasks):
        return TaskScanner.countTasksByStatus(tasks, 'Failed')
    
    @staticmethod
    def countTasksByStatus(tasks, status):
        counter = 0
        for task in tasks:
            if task['status'] == status:
                counter += 1
        return counter
        
    def appendTask(self, path):        
        with self._lock:
            self._appendTaskNotSafe(path)
    
    def _appendTaskNotSafe(self, path):
        task = self._getStructIfTaskOrNone(path)
        if task:
            self._tasks.append(task)
            self._increaseNumOfTasksInGenInfo(task)
            
            if not task['type'] in self._generalInfo['types']:
                self._generalInfo['types'].append(task['type'])
        return task
    
    def removeTask(self, path):        
        with self._lock:
            self._removeTaskNotSafe(path)
                    
    def _removeTaskNotSafe(self, path):
        for task in self._tasks:
            if task['srcPath'] == path:
                self._tasks.remove(task)
                self._decreaseNumOfTasksInGenInfo(task)
                
    def _increaseNumOfTasksInGenInfo(self, task):
        self._generalInfo['total'] += 1
        self._generalInfo[task['status'].lower()] += 1
    
    def _decreaseNumOfTasksInGenInfo(self, task):
        self._generalInfo['total'] -= 1
        self._generalInfo[task['status'].lower()] -= 1
                
    def _scanByType(self, type_):
        servers = self._getServersFromType(type_)
        for s in servers:
            self._scanTasksFromServer(type_, s)

    def getTypes(self):
        return FileSystem.getDirs(self._requestDir)

    def _getServersFromType(self, type_):
        dirPath = Path.appendToPath(self._requestDir, type_)
        return FileSystem.getDirs(dirPath)

    def _scanTasksFromServer(self, type_, server):
        numOfFailed = self._scanFailedTasksFromServer(type_, server)
        numOfProcessed = self._scanProcessedTasksFromServer(type_, server)
        
        if numOfFailed and numOfProcessed:
            addedFailedTasks = self._tasks[-numOfFailed:]
            addedProcessedTasks = self._tasks[-numOfProcessed:]
            self._excludeFromFailedIfTaskInProcessed(addedFailedTasks, addedProcessedTasks)
    
    def _excludeFromFailedIfTaskInProcessed(self, failedTasks: list, processedTasks: list):
        '''
        Should only be called when comparing tasks from the same server,
        because tasks on different servers can have the same ID.
        '''
        for ft in failedTasks:
            for pt in processedTasks:
                if ft['id'] == pt['id']:
                    self._removeTaskNotSafe(ft['srcPath'])

    def _scanFailedTasksFromServer(self, type_, server):
        return self._scanTasksFromServerByStatus(type_, server, 'Failed')

    def _scanProcessedTasksFromServer(self, type_, server):
        return self._scanTasksFromServerByStatus(type_, server, 'Processed')

    def _scanTasksFromServerByStatus(self, type_, server, status):
        '''Returns the number of tasks added.'''
        counter = 0
        dirPath = Path.appendListToPath(self._requestDir, (type_, server, status))
        
        if not FileSystem.isDir(dirPath):
            return 0
            
        files = FileSystem.getFiles(dirPath)

        for fileName in files:
            filePath = Path.appendToPath(dirPath, fileName)
            if self._appendTaskNotSafe(filePath):
                counter += 1
        
        return counter

    def _getStructIfTaskOrNone(self, path):
        relativePath = Path.removePrefix(path, self._requestDir)
        partsOfPath = Path.getParts(relativePath)
        
        if len(partsOfPath) != 4:
            return None
        
        task = {'srcPath': relativePath}        
        type_ = partsOfPath[0]
        server = partsOfPath[1]
        status = partsOfPath[2]
        filename = partsOfPath[3]
        
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
