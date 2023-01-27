from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


OBSERVER = Observer()


class FSEventHandler(FileSystemEventHandler):
    
    def __init__(self, taskScanner) -> None:
        self.taskScanner = taskScanner
        super().__init__()

    def on_created(self, event):
        if event.is_directory:
            pass
        else:
            self.taskScanner.appendTask(event.src_path.strip())

    def on_deleted(self, event):
        if event.is_directory:
            pass
        else:
            self.taskScanner.removeTask(event.src_path.strip())
      

def startObserver(taskScanner, path):
    eventHandler = FSEventHandler(taskScanner)
    OBSERVER.schedule(eventHandler, path=path, recursive=True)
    OBSERVER.start()
    

def stopObserver(taskFile, path):
    OBSERVER.stop()