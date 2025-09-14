import React, { useEffect, useState } from "react";
import { Folder } from "lucide-react";
import { useSystemActions } from "../store/useSystemStore";

const FilesApp: React.FC<{ windowId?: string }> = () => {
  const actions = useSystemActions();
  const [currentPath, setCurrentPath] = useState("/"); 
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const items = await actions.listDirectory(currentPath);
        setFiles(items);
      } catch {
        setFiles(["README.md","Documents","Pictures","Music"]);
      }
    })();
  }, [currentPath]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Path:</span>
          <span className="font-mono text-sm">{currentPath}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Folder className="w-12 h-12 text-blue-500 mb-2" />
              <span className="text-sm text-center">{file}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesApp;
