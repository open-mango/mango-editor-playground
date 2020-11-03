import React from 'react';
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Map } from 'immutable'

import {
  Editor,
  EditorState,
  ContentBlock,
  convertToRaw,
  getDefaultKeyBinding,
  ContentState,
  RichUtils,
  convertFromHTML,
  Modifier
} from 'draft-js'
import { Box, createStyles, makeStyles, Theme, IconButton } from '@material-ui/core';

import FormatBoldRoundedIcon from '@material-ui/icons/FormatBoldRounded';
import FormatItalicRoundedIcon from '@material-ui/icons/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@material-ui/icons/FormatUnderlinedRounded';
import StrikethroughSRoundedIcon from '@material-ui/icons/StrikethroughSRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';

import FormatIndentIncreaseRoundedIcon from '@material-ui/icons/FormatIndentIncreaseRounded';
import FormatListNumberedRoundedIcon from '@material-ui/icons/FormatListNumberedRounded';
import FormatListBulletedRoundedIcon from '@material-ui/icons/FormatListBulletedRounded';
import DeveloperModeRoundedIcon from '@material-ui/icons/DeveloperModeRounded';

import 'react-perfect-scrollbar/dist/css/styles.css'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      display: 'flex'
    },
    button: {
      padding: theme.spacing(0.75),
      borderRadius: 2,
      marginRight: 1
    },
    active: {
      backgroundColor: theme.palette.grey[400]
    },
    editorContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
      width: '100vw',
      height: '100vh'
    }
  })
)

export type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;
export type SyntheticEvent = React.SyntheticEvent<{}>;

const styleMap = {
  UNDERLINE: {
    textDecoration: 'underline'
  },
  STRKIETHROUGH: {
    textDecoration: 'line-through'
  },
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontSize: 14,
    paddingLeft: 4,
    paddingRight: 4
  }
}

const BLOCK_TYPES = [
  { label: 'BQ', style: 'blockquote', component: <FormatIndentIncreaseRoundedIcon fontSize="small" /> },
  { label: 'UL', style: 'unordered-list-item', component: <FormatListBulletedRoundedIcon fontSize="small" /> },
  { label: 'OL', style: 'ordered-list-item', component: <FormatListNumberedRoundedIcon fontSize="small" /> },
  { label: 'CB', style: 'code-block', component: <DeveloperModeRoundedIcon fontSize="small" /> },
];

const INLINE_STYLES = [
  { label: 'B', style: 'BOLD', component: <FormatBoldRoundedIcon fontSize="small" /> },
  { label: 'I', style: 'ITALIC', component: <FormatItalicRoundedIcon fontSize="small" /> },
  { label: 'S', style: 'STRIKETHROUGH', component: <StrikethroughSRoundedIcon fontSize="small" /> },
  { label: 'U', style: 'UNDERLINE', component: <FormatUnderlinedRoundedIcon fontSize="small" /> },
  { label: 'C', style: 'CODE', component: <CodeRoundedIcon fontSize="small" /> },
];

const StyleButton = (
  { label, active, style, component, onToggle }:
  { label: string, active: boolean, style: string, component: JSX.Element, onToggle: (type: string) => void }
) => {
  const classes = useStyles()

  const styleClasses = classnames({
    [classes.button]: true,
    [classes.active]: active
  })

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    onToggle(style)
  }

  return (
    <IconButton
      className={styleClasses}
      onMouseDown={handleToggle}
    >
      {component}
    </IconButton>
  )
}

const InlineStyleControls = (
  { editorState, onToggle }:
  { editorState: EditorState, onToggle: (type: string) => void }
) => {
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type, index) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          component={type.component}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </div>
  )
}

const BlockStyleControls = (
  { editorState, onToggle }:
  { editorState: EditorState, onToggle: (type: string) => void }
) => {
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map(type =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          component={type.component}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </div>
  )
}

function App() {
  const classes = useStyles()
  const editor = React.useRef<Editor>(null)
  const [editorState, setEditorState] = React.useState<EditorState>(
    EditorState.set(EditorState.createEmpty(), {
      allowUndo: false
    })
  )

  const renderBlock = (contentBlock: ContentBlock) => {
    if (contentBlock.getType() === 'atomic') {
      console.log('atomic content type')
    }
  }

  const blockRenderMap = Map({
    'unstyled': {
      element: 'div'
    },
    'code-block': {
      element: 'code',
      wrapper: <pre spellCheck="false" />
    },
    'blockquote': {
      element: 'blockquote'
    },
    'ordered-list-item': {
      element: 'ol'
    },
    'unordered-list-item': {
      element: 'ul'
    }
  })

  const removeBlockFromBlockmap = (editorState: EditorState, key: string) => {
    const cs = editorState.getCurrentContent()
    const bm = cs.getBlockMap()
    const nbm = bm.remove(key)
    const ncs = cs.merge({
      blockMap: nbm
    }) as ContentState

    let nes = null
    if (ncs.getBlockMap().size < 1) {
      nes = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
    } else {
      nes = EditorState.push(editorState, ncs, 'remove-range')
    }

    // editorState 를 변경하고 난 뒤에는 반드시 focus 를 끝으로 보내줘야 함
    // https://github.com/facebook/draft-js/issues/1198
    setEditorState(EditorState.moveFocusToEnd(nes))
  }

  const handleKeyBinding = (e: SyntheticKeyboardEvent) => {
    if (e.metaKey && e.key === 'z') {
      console.log('editor-undo')
      return 'editor-undo'
    }

    return getDefaultKeyBinding(e);
  }

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    if (command === 'editor-save') {
      const es = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      setEditorState(EditorState.moveFocusToEnd(es))
      return 'handled'
    }

    if (command === 'editor-undo') {
      removeBlockFromBlockmap(editorState, editorState.getSelection().getAnchorKey())
      return 'handled'
    }

    const nes = RichUtils.handleKeyCommand(editorState, command)
    if (nes) {
      setEditorState(EditorState.moveFocusToEnd(nes))
      return 'handled'
    }

    return 'not-handled'
  }

  const focusEditor = () => {
    editor.current?.focus()
  }

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (!e.shiftKey) {
      const content = editorState.getCurrentContent()
      if (content.getPlainText('').length < 1) return 'not-handled'

      const message = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      console.log(message)

      const es = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      setEditorState(EditorState.moveFocusToEnd(es))
      return 'handled'
    }

    if (e.key === 'handle') {
      return 'handled'
    }

    return 'not-handled'
  }

  const handlePastedText = (text: string, html: string | undefined, editorState: EditorState) => {
    if (html) {
      console.log(html)
      const blocksFromHTML = convertFromHTML(html)
      const pastedBlocks = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      ).getBlockMap()

      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        pastedBlocks
      )

      const newEditorState = EditorState.push(editorState, newState, "insert-fragment");
      setEditorState(EditorState.moveFocusToEnd(newEditorState))

      return 'handled'
    }

    if (text) {
      const pastedBlocks = ContentState.createFromText(text).getBlockMap();
      const newState = Modifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          pastedBlocks,
      );

      const newEditorState = EditorState.push(editorState, newState, "insert-fragment");
      setEditorState(EditorState.moveFocusToEnd(newEditorState))

      return 'handled'
    }

    return 'not-handled'
  }

  const handleToggleBlockType = (type: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, type))
  }

  const handleToggleInlineStyleType = (type: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, type))
  }

  const handleBeforeInput = (chars: string, editorState: EditorState, eventTimeStamp: number) => {
    if (chars === ' ' || chars === '`') {
      const selection = editorState.getSelection()
      const command = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getText()

      switch (command) {
        case '-':
          _smartKeyCommand('block', 'unordered-list-item', editorState)
          return 'handled'
        case '>':
          _smartKeyCommand('block', 'blockquote', editorState)
          chars = ''
          return 'handled'
        case '``':
          _smartKeyCommand('block', 'code-block', editorState)
          chars = ''
          return 'handled'
        default:
          return 'not-handled'
      }
    }

    return 'not-handled'
  }

  const _smartKeyCommand = (type: 'block' | 'inline', style: string, editorState: EditorState, remainCommand?: boolean) => {

    if (type === 'block') {
      setEditorState(RichUtils.toggleBlockType(editorState, style))
    } else {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style))
    }

  }

  return (
    <div
      className={classes.editorContainer}
      onClick={focusEditor}
    >
      <div className={classes.toolbar}>
        <InlineStyleControls
          editorState={editorState}
          onToggle={handleToggleInlineStyleType}
        />
        <BlockStyleControls
          editorState={editorState}
          onToggle={handleToggleBlockType}
        />
      </div>
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={setEditorState}
        blockRendererFn={renderBlock}
        blockRenderMap={blockRenderMap}
        customStyleMap={styleMap}
        keyBindingFn={handleKeyBinding}
        handleKeyCommand={handleKeyCommand}
        handleReturn={handleReturn}
        handlePastedText={handlePastedText}
        handleBeforeInput={handleBeforeInput}
      />
      <PerfectScrollbar>
        <Box>
          <pre>
            {JSON.stringify(
              convertToRaw(editorState.getCurrentContent()),
              null,
              2
            )}
          </pre>
        </Box>
      </PerfectScrollbar>
    </div>
  )
}

export default App;
