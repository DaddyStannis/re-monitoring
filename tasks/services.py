def readFile(path, mode):
  with open(path, mode) as file:
    return file.read()