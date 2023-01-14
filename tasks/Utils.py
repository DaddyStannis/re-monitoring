import os
import re
import json


def getJsonInHtmlFormat(data):
    data = json.dumps(json.loads(data), indent=4)
    return transformTextInHtmlFormat(data)


def transformTextInHtmlFormat(text):
    text = re.sub(r'\n', r'<br>', text)
    text = re.sub(r' ', r'&nbsp', text)
    return text
    
    
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
    def appendListToPath(path, dirNames):
        for dn in dirNames:
            path = Path.appendToPath(path, dn)
        return path
    
    @staticmethod
    def appendToPath(path, fileName):
        return os.path.join(path, fileName)

    @staticmethod
    def getPathWithoutBasename(path):
        return os.path.dirname(path)
    
    @staticmethod
    def removePrefix(path, prefix):
        return os.path.relpath(path, prefix)
    
    @staticmethod
    def getParts(path):
        path = os.path.normpath(path)
        return path.split(os.sep)
        