import React, { useState } from 'react'
import { MuiThemeProvider } from '@material-ui/core'
import { themeCreator } from './themes/base'

type Theme = 'light' | 'dark'
type ThemeContextValue = { themeName: Theme; setThemeName: (themeName: Theme) => void }

export const ThemeContext = React.createContext<ThemeContextValue>({} as ThemeContextValue)
export type ThemeProviderProps = {
  children: React.ReactNode;
}

function ThemeProvider(props: ThemeProviderProps) {
    const curThemeName: Theme = localStorage.getItem('mango-theme') as Theme || 'light'
    const [themeName, _setThemeName] = useState<Theme>(curThemeName)
    const theme = themeCreator(themeName)

    const setThemeName = (themeName: Theme): void => {
      localStorage.setItem('mango-theme', themeName)
      _setThemeName(themeName)
    }

    return (
      <ThemeContext.Provider value={{ themeName, setThemeName }}>
        <MuiThemeProvider theme={theme}>
          {props.children}
        </MuiThemeProvider>
      </ThemeContext.Provider>
    )
}

export default ThemeProvider