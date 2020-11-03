import { Theme } from '@material-ui/core'

import { light } from './light'
import { dark } from './dark'

const themeMap: { [key: string]: Theme } = {
  light,
  dark
}
export function themeCreator(theme: string): Theme {
  return themeMap[theme]
}

