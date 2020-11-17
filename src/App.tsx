import 'react-app-polyfill/ie11';
import * as React from 'react';
import MangoEditor, { SyntheticKeyboardEvent } from 'mango-plugins-editor'
import { ContentState, convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { createStyles, Divider, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    info: {
      marginTop: theme.spacing(2)
    }
  })
)

const App = () => {
  const classes = useStyles()
  const initialContent = EditorState.createEmpty()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (!e.shiftKey) {
      handleSendMessage(editorState)
      return 'handled'
    }

    return 'not-handled'
  }

  const handleSendMessage = (editorState: EditorState) => {
    const content = editorState.getCurrentContent()
    if (content.getPlainText('').length < 1) return 'not-handled'

    const message = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    setMessages(prev => [...prev, message])

    setTimeout(() => {
      _clearEditorState(editorState)
    }, 10)
  }

  const _clearEditorState = (editorState: EditorState) => {
    const es = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
    setEditorState(EditorState.moveFocusToEnd(es))
  }

  return (
    <div className={classes.root}>
      <h1>Mango Editor</h1>
      <div className="markdown-body">
        {messages.map((message, index) => (
          <div style={{ padding: 10 }}>
            <MangoEditor
              editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(message)))}
              readOnly={true}
              onChange={setEditorState}
            />
          </div>
        ))}
        <MangoEditor
          placeholder="Enter your messages (Shift + Enter for new line)"
          editorState={editorState}
          onChange={setEditorState}
          handleReturn={handleReturn}
        />
      </div>
      <div className={classes.info}>
        These buttons are not working yet. please read <a href="https://github.com/open-mango/editor#todo">document</a>
        <ul>
          <li>Flash Button</li>
          <li>Text Format Button</li>
          <li>Mention Button</li>
          <li>File Button</li>
        </ul>
      </div>
    </div>
  );
};

export default App

