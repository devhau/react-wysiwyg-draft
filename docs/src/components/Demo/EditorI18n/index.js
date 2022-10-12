/* @flow */

import React from 'react';
import { Editor } from 'react-wysiwyg-draft';
import Codemirror from 'react-codemirror';

const EditorI18n = () => (
  <div className="demo-section">
    <h3>7. Editor i18n - korean locale.</h3>
    <div className="demo-section-wrapper">
      <div className="demo-editor-wrapper">
        <Editor
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            localization={{
              locale: 'ko',
            }}
          />
      </div>
      <Codemirror
        value={
          'import React from \'react\';\n' +
          'import { Editor } from \'react-wysiwyg-draft\';\n' +
          '\n\n' +
          'const EditorI18n = () => (\n' +
          '  <Editor\n' +
          '    wrapperClassName="demo-wrapper"\n' +
          '    editorClassName="demo-editor"\n' +
          '    localization={{\n' +
          '      locale: \'ko\',\n' +
          '    }}\n' +
          '  />\n' +
          ');'
        }
        options={{
          lineNumbers: true,
          mode: 'jsx',
          readOnly: true,
        }}
      />
    </div>
  </div>
);

export default EditorI18n;
