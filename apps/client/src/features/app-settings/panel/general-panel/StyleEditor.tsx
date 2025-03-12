import { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { BundledLanguage, BundledTheme, createHighlighter, HighlighterGeneric } from 'shiki';

import style from './StyleEditor.module.scss';

interface CodeEditorProps {
  language: string;
  initialValue: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ language = 'css', initialValue = '', onChange }: CodeEditorProps) => {
  const [highlighter, setHighlighter] = useState<HighlighterGeneric<BundledLanguage, BundledTheme> | null>(null);
  const [code, setCode] = useState(initialValue);

  useEffect(() => {
    async function initializeHighlighter() {
      const highlighter = await createHighlighter({
        themes: ['vitesse-dark'],
        langs: [language],
      });

      setHighlighter(highlighter);
    }

    initializeHighlighter();
  }, []);

  useEffect(() => {
    setCode(initialValue);
  }, [initialValue]);

  const highlight = (code: string) => {
    return highlighter
      ? highlighter.codeToHtml(code, {
          theme: 'vitesse-dark',
          lang: language,
          transformers: [
            {
              code(node) {
                node.properties.style = 'white-space: pre-wrap;';
              },
            },
          ],
        })
      : code;
  };

  const handleChange = (newCode: string) => {
    setCode(newCode);
    if (onChange) onChange(newCode);
  };

  return (
    <div className={style.wrapper}>
      <Editor value={code} padding={15} onValueChange={handleChange} highlight={highlight} className={style.code} />
    </div>
  );
};

export default CodeEditor;
