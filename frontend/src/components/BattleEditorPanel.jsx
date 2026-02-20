import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, SendIcon } from "lucide-react";
import { useRef } from "react";
import { LANGUAGE_CONFIG } from "../data/data";

function BattleEditorPanel({
  code,
  setCode,
  language,
  setLanguage,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  battleStatus,
}) {
  const editorRef = useRef(null);

  // Allow run during waiting and in-progress (for testing), disable during countdown and finished
  const disableRun =
    battleStatus === "countdown" || battleStatus === "finished";
  // Only allow submit during in-progress
  const disableSubmit = battleStatus !== "in-progress";
  const readOnly = battleStatus === "finished";

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        editor.getAction("editor.action.formatDocument").run();
      },
    );
  };

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300 gap-4">
        <div className="flex items-center gap-3">
          {LANGUAGE_CONFIG[language]?.icon && (
            <img
              src={LANGUAGE_CONFIG[language].icon}
              alt={LANGUAGE_CONFIG[language].name}
              className="size-6"
            />
          )}
          <select
            className="select select-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={readOnly}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm gap-2"
            disabled={disableRun || isRunning}
            onClick={onRun}
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

          <button
            className="btn btn-accent btn-sm gap-2"
            disabled={disableSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="size-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[language]?.monacoLang || "javascript"}
          value={code}
          onChange={setCode}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            readOnly,
          }}
        />
      </div>
    </div>
  );
}

export default BattleEditorPanel;
