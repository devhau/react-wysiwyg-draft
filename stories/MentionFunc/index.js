/* @flow */

import React, { useRef, useState } from 'react';
import { Editor } from '../../src';

let data = [
  { text: 'APPLE', value: 1 },
  { text: 'BANANA', value: 2},
  { text: 'CHERRY', value: 3 },
  { text: 'DURIAN', value:4 },
  { text: 'EGGFRUIT', value:5 },
  { text: 'FIG', value: 6, url: 'fig' },
  { text: 'GRAPEFRUIT', value: 7, url: 'grapefruit' },
  { text: 'HONEYDEW', value: 8, url: 'honeydew' },
];
/**
 * Default trigger is '@' and default separator between words is ' '.
 * thus there fields are optional.
*/
const MentionFunc = () => {

  const [suggestions, setSuggestions] = useState(data);
  const refEditor = useRef();
  return (<div className="rdw-storybook-root">
    <span>Type @ to see suggestions for Func</span>
    <Editor
      ref={refEditor}
      mention={{
        separator: ' ',
        trigger: '@',
        canceltrigger:true,
        suggestions: () => suggestions,
        func: (mentionText, caseSensitive, callBack) => {
          console.log(mentionText);
          setSuggestions(data.filter(suggestion => {
            if (!mentionText || mentionText.length === 0) {
              return true;
            }
            if (caseSensitive) {
              return suggestion.value.toString().indexOf(mentionText) >= 0||suggestion.text.toString().indexOf(mentionText) >= 0;
            }
            return (
              suggestion.value.toString()
                .toLowerCase()
                .indexOf(mentionText && mentionText.toLowerCase()) >= 0||suggestion.text.toString()
                .toLowerCase()
                .indexOf(mentionText && mentionText.toLowerCase()) >= 0
            );
          }));
         // refEditor.current.modalHandler.setFilteredSuggestions(suggestions);
         callBack && callBack(suggestions);
        }
      }}
      toolbarClassName="rdw-storybook-toolbar"
      wrapperClassName="rdw-storybook-wrapper"
      editorClassName="rdw-storybook-editor"
    />
  </div>);
}

export default MentionFunc;
