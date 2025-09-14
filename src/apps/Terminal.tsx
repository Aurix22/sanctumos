import React, { useRef, useState } from "react";

const TerminalApp: React.FC<{ windowId?: string }> = () => {
  const [history, setHistory] = useState<string[]>([
    "Sanctum Terminal v1.0.0",
    'Type "help" for available commands',
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    setHistory(prev => [...prev, `$ ${trimmed}`]);
    const [cmd, ...args] = trimmed.split(" ");

    const append = (line: string) => setHistory(prev => [...prev, line, ""]);

    switch (cmd) {
      case "help":
        setHistory(prev => [...prev,
          "Available commands:",
          "  help     - Show this help",
          "  clear    - Clear terminal",
          "  echo     - Echo text",
          "  date     - Show current date",
          "  whoami   - Show current user",
          ""
        ]);
        break;
      case "clear":
        setHistory([""]);
        break;
      case "echo":
        append(args.join(" "));
        break;
      case "date":
        append(new Date().toString());
        break;
      case "whoami":
        append("user@sanctum");
        break;
      default:
        append(`Command not found: ${cmd}`);
    }
  };

  return (
    <div className="h-full bg-black text-green-400 font-mono p-4 overflow-auto" onClick={() => inputRef.current?.focus()}>
      {history.map((line, i) => (<div key={i}>{line}</div>))}
      <div className="flex">
        <span>$ </span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { executeCommand(currentCommand); setCurrentCommand(""); } }}
          className="flex-1 bg-transparent outline-none ml-2"
          autoFocus
        />
      </div>
    </div>
  );
};

export default TerminalApp;
