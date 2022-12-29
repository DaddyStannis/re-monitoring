import os


class FileSystem:

    @staticmethod
    def getFileModifiedTime(path):
        return os.path.getmtime(path)

    @staticmethod
    def getFiles(path):
        path = str(path)
        return [f for f in os.listdir(path) if os.path.isfile(f'{path}/{f}')]

    @staticmethod
    def getDirs(path):
        path = str(path)
        return [d for d in os.listdir(path) if os.path.isdir(f'{path}/{d}')]

    @staticmethod
    def getFile(path):
        with open(path, 'r') as f:
            return f.read()
    
    @staticmethod
    def isFile(path):
        return os.path.isfile(path)

    @staticmethod
    def isDir(path):
        return os.path.isdir(path)


class Path:

    @staticmethod
    def appendDirToPath(path, dirName):
        path = str(path)
        if path[-1] != '/':
            path += '/'
        if dirName[-1] != '/':
            dirName += '/'
        return path + dirName

    @staticmethod
    def appendDirsToPath(path, dirNames):
        for dn in dirNames:
            path = Path.appendDirToPath(path, dn)
        return path
    
    @staticmethod
    def appendFileToPath(path, fileName):
        return str(path) + fileName

    @staticmethod
    def getPathWithoutBasename(path):
        return os.path.dirname(path) + '/'