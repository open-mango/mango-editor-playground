import 'react-app-polyfill/ie11';
import * as React from 'react';
import MangoEditor, { SyntheticKeyboardEvent } from 'mango-plugins-editor'
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { makeStyles, Theme, createStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 500,
      margin: '0 auto',
    },
    info: {
      marginTop: theme.spacing(2)
    }
  })
)


const users = [
  {
    id: 1,
    name: 'John Malkovichi',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  },
  {
    id: 2,
    name: 'Tom Hanks',
    avatar: undefined,
    email: 'tom@gmail.com',
    online: false
  },
  {
    id: 3,
    name: 'Scarlett Johansson',
    avatar: undefined,
    email: 'scarlett@gmail.com',
    online: true
  },
  {
    id: 4,
    name: '홍길동',
    avatar: undefined,
    email: 'hong@gmail.com',
    online: true
  },
  {
    id: 5,
    name: '김철수',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  }
]

const App = () => {
  const classes = useStyles()
  const initialContent = EditorState.createEmpty()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)
  const [editorMode, setEditorMode] = React.useState<'chat' | 'editor'>('chat')

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (editorMode === 'chat' && !e.shiftKey) {
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
  }

  const handleExtraButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setEditorMode(prev => prev === 'chat' ? 'editor' : 'chat')
  }

  return (
    <div className={classes.root}>
      <h1>Mango Editor</h1>
      <strong style={{ marginBottom: '20px' }}>ver 0.3.2</strong>
      <div
        className="markdown-body"
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: 6 }}>
            <MangoEditor
              editorMode={editorMode}
              editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(message)))}
              readOnly={true}
              onChange={setEditorState}
            />
          </div>
        ))}
        <MangoEditor
          editorMode={editorMode}
          mentions={users}
          editorState={editorState}
          onChange={setEditorState}
          onHandleReturn={handleReturn}
          onExtraButtonClick={handleExtraButtonClick}
        />
      </div>
      <div className={classes.info}>
        Press extra button to change editor mode 'chat' and 'editor'<br />
        These buttons are not working yet. please read <a href="https://github.com/open-mango/editor#todo">document</a>
        <ul>
          <li>Text Format Button</li>
        </ul>
      </div>
    </div>
  );
};

export default App
