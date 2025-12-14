import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useRef } from "react";
import { LANGUAGE_CONFIG } from "../data/data";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    // Format on Ctrl+S (Cmd+S on Mac)
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        editor.getAction("editor.action.formatDocument").run();
      }
    );
  };

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage].icon}
            alt={LANGUAGE_CONFIG[selectedLanguage].name}
            className="size-6"
          />
          <select
            className="select select-sm"
            value={selectedLanguage}
            onChange={onLanguageChange}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-sm gap-2"
          disabled={isRunning}
          onClick={onRunCode}
        >
          {isRunning ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
export default CodeEditorPanel;
