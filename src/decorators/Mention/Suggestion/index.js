import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import addMention from "../addMention";
import KeyDownHandler from "../../../event-handler/keyDown";
import SuggestionHandler from "../../../event-handler/suggestions";
import "./styles.css";
const checkText = (text, mentionText, caseSensitive) => {
  if (!text) return false;
  if (caseSensitive) {
    return !mentionText || text.toString().indexOf(mentionText) >= 0;
  } else {
    return (
      !mentionText ||
      text
        .toString()
        .toLowerCase()
        .indexOf(mentionText && mentionText.toLowerCase()) >= 0
    );
  }
};
class Suggestion {
  constructor(config) {
    const {
      separator,
      trigger,
      getSuggestions,
      triggerChangeSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      dropdownClassName,
      optionClassName,
      modalHandler,
    } = config;
    this.config = {
      separator,
      trigger,
      getSuggestions,
      triggerChangeSuggestions,
      onChange,
      getEditorState,
      getWrapperRef,
      caseSensitive,
      dropdownClassName,
      optionClassName,
      modalHandler,
    };
  }

  idTimeoutSuggest = undefined;

  findSuggestionEntities = (contentBlock, callback) => {
    if (this.config.getEditorState()) {
      const {
        separator,
        trigger,
        getEditorState,
        triggerChangeSuggestions,
        getSuggestions,
        caseSensitive,
        timeoutSuggestion,
      } = this.config;
      const selection = getEditorState().getSelection();
      if (
        selection.get("anchorKey") === contentBlock.get("key") &&
        selection.get("anchorKey") === selection.get("focusKey")
      ) {
        let text = contentBlock.getText();
        text = text.substr(
          0,
          selection.get("focusOffset") === text.length - 1
            ? text.length
            : selection.get("focusOffset") + 1
        );
        let index = text.lastIndexOf(separator + trigger);
        let preText = separator + trigger;
        if ((index === undefined || index < 0) && text[0] === trigger) {
          index = 0;
          preText = trigger;
        }
        if (index >= 0) {
          const mentionText = text.substr(index + preText.length, text.length);
          let timeoutSuggestionTemp =
            (timeoutSuggestion ?? 0) > 400 ? timeoutSuggestion : 400;
          if (this.idTimeoutSuggest) {
            clearTimeout(this.idTimeoutSuggest);
            this.idTimeoutSuggest = undefined;
          }
          this.idTimeoutSuggest = setTimeout(() => {
            triggerChangeSuggestions?.()?.(
              mentionText,
              caseSensitive,
              (data) => {
                this.config.modalHandler.setFilteredSuggestions(data);
              }
            );
            this.idTimeoutSuggest = undefined;
          }, timeoutSuggestionTemp);

          const suggestionPresent = getSuggestions()?.some((suggestion) => {
            return (
              checkText(suggestion.value, mentionText, caseSensitive) ||
              checkText(suggestion.text, mentionText, caseSensitive)
            );
          });
          if (suggestionPresent) {
            callback(index === 0 ? 0 : index + 1, text.length);
          }
        }
      }
    }
  };

  getSuggestionComponent = getSuggestionComponent.bind(this);

  getSuggestionDecorator = () => ({
    strategy: this.findSuggestionEntities,
    component: this.getSuggestionComponent(),
  });
}

function getSuggestionComponent() {
  const { config } = this;
  const { triggerChangeSuggestions, getSuggestions, canceltrigger } = config;
  return class SuggestionComponent extends Component {
    static propTypes = {
      children: PropTypes.array,
    };

    state = {
      style: { left: 15 },
      activeOption: -1,
      showSuggestions: true,
      flg: false,
    };

    componentDidMount() {
      const editorRect = config.getWrapperRef().getBoundingClientRect();
      const suggestionRect = this.suggestion.getBoundingClientRect();
      const dropdownRect = this.dropdown.getBoundingClientRect();
      let left;
      let right;
      let bottom;
      if (
        editorRect.width <
        suggestionRect.left - editorRect.left + dropdownRect.width
      ) {
        right = 15;
      } else {
        left = 15;
      }
      if (editorRect.bottom < dropdownRect.bottom) {
        bottom = 0;
      }
      this.setState({
        // eslint-disable-line react/no-did-mount-set-state
        style: { left, right, bottom },
      });
      KeyDownHandler.registerCallBack(this.onEditorKeyDown);
      SuggestionHandler.open();
      config.modalHandler.setSuggestionCallback(this.closeSuggestionDropdown);
      config.modalHandler.setFilteredSuggestionsCallback(
        this.setFilteredSuggestions.bind(this)
      );
      this.filterSuggestions(this.props);
    }
    componentDidUpdate(props) {
      const { children } = this.props;
      if (children !== props.children) {
        this.filterSuggestions(props);
        this.setState({
          showSuggestions: true,
        });
      }
    }
    setFilteredSuggestions(data) {
      this.filteredSuggestions = data ?? [];
      this.setState({
        flg: !this.state.flg,
      });
    }
    componentWillUnmount() {
      KeyDownHandler.deregisterCallBack(this.onEditorKeyDown);
      SuggestionHandler.close();
      config.modalHandler.removeSuggestionCallback();
      config.modalHandler.removeFilteredSuggestionsCallback();
    }

    onEditorKeyDown = (event) => {
      const { activeOption } = this.state;
      const newState = {};
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (activeOption === this.filteredSuggestions.length - 1) {
          newState.activeOption = 0;
        } else {
          newState.activeOption = activeOption + 1;
        }
      } else if (event.key === "ArrowUp") {
        if (activeOption <= 0) {
          newState.activeOption = this.filteredSuggestions.length - 1;
        } else {
          newState.activeOption = activeOption - 1;
        }
      } else if (event.key === "Escape") {
        newState.showSuggestions = false;
        SuggestionHandler.close();
      } else if (event.key === "Enter") {
        this.addMention();
      }
      this.setState(newState);
    };

    onOptionMouseEnter = (event) => {
      const index = event.target.getAttribute("data-index");
      this.setState({
        activeOption: index,
      });
    };

    onOptionMouseLeave = () => {
      this.setState({
        activeOption: -1,
      });
    };

    setSuggestionReference = (ref) => {
      this.suggestion = ref;
    };

    setDropdownReference = (ref) => {
      this.dropdown = ref;
    };

    closeSuggestionDropdown = () => {
      this.setState({
        showSuggestions: false,
      });
    };

    filteredSuggestions = [];

    filterSuggestions = (props) => {
      if (canceltrigger) return;
      const mentionText = props.children[0].props.text.substr(1);
      setTimeout(() => {
        triggerChangeSuggestions?.()?.(mentionText, config.caseSensitive);
      });
      this.filteredSuggestions =
        getSuggestions()?.filter((suggestion) => {
          if (!mentionText || mentionText.length === 0) {
            return true;
          }
          return (
            checkText(suggestion.value, mentionText, config.caseSensitive) ||
            checkText(suggestion.text, mentionText, config.caseSensitive)
          );
        }) ?? [];
    };

    addMention = () => {
      const { activeOption } = this.state;
      const editorState = config.getEditorState();
      const { onChange, separator, trigger } = config;
      const selectedMention = this.filteredSuggestions[activeOption];
      if (selectedMention) {
        addMention(editorState, onChange, separator, trigger, selectedMention);
      }
    };

    render() {
      const { children } = this.props;
      const { activeOption, showSuggestions } = this.state;
      const { dropdownClassName, optionClassName } = config;
      return (
        <span
          className="rdw-suggestion-wrapper"
          ref={this.setSuggestionReference}
          onClick={config.modalHandler.onSuggestionClick}
          aria-haspopup="true"
          aria-label="rdw-suggestion-popup"
        >
          <span>{children}</span>
          {showSuggestions && (
            <span
              className={classNames(
                "rdw-suggestion-dropdown",
                dropdownClassName
              )}
              contentEditable="false"
              suppressContentEditableWarning
              style={this.state.style}
              ref={this.setDropdownReference}
            >
              {this.filteredSuggestions.map((suggestion, index) => (
                <span
                  key={index}
                  spellCheck={false}
                  onClick={this.addMention}
                  data-index={index}
                  onMouseEnter={this.onOptionMouseEnter}
                  onMouseLeave={this.onOptionMouseLeave}
                  className={classNames(
                    "rdw-suggestion-option",
                    optionClassName,
                    { "rdw-suggestion-option-active": index === activeOption }
                  )}
                >
                  {suggestion.text}
                </span>
              ))}
            </span>
          )}
        </span>
      );
    }
  };
}

export default Suggestion;
