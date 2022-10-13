/* @flow */

import React, { useRef, useState } from 'react';
import { Editor } from '../../src';

let data = [
  { text: 'APPLE', value: 'apple', url: 'apple' },
  { text: 'BANANA', value: 'banana', url: 'banana' },
  { text: 'CHERRY', value: 'cherry', url: 'cherry' },
  { text: 'DURIAN', value: 'durian', url: 'durian' },
  { text: 'EGGFRUIT', value: 'eggfruit', url: 'eggfruit' },
  { text: 'FIG', value: 'fig', url: 'fig' },
  { text: 'GRAPEFRUIT', value: 'grapefruit', url: 'grapefruit' },
  { text: 'HONEYDEW', value: 'honeydew', url: 'honeydew' },
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
          setTimeout(() => {
            setSuggestions(data.filter(suggestion => {
              if (!mentionText || mentionText.length === 0) {
                return true;
              }
              if (caseSensitive) {
                return suggestion.value.indexOf(mentionText) >= 0;
              }
              return (
                suggestion.value
                  .toLowerCase()
                  .indexOf(mentionText && mentionText.toLowerCase()) >= 0
              );
            }));
            refEditor.current.modalHandler.setFilteredSuggestions(suggestions);
           // callBack && callBack(suggestions);
          },2000);

        }
      }}
      toolbarClassName="rdw-storybook-toolbar"
      wrapperClassName="rdw-storybook-wrapper"
      editorClassName="rdw-storybook-editor"
    />
  </div>);
}

export default MentionFunc;
