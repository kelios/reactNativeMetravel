import type { ScaledSize } from 'react-native'
import { Dimensions } from 'react-native'

import { isWeb } from '@/src/utils'

export const HEADER_HEIGHT = 100

export const ElementsText = {
  AUTOPLAY: 'AutoPlay',
}

export const window: ScaledSize = isWeb
  ? {
      ...Dimensions.get('window'),
      width: 700,
    }
  : Dimensions.get('window')

export const BREAKPOINTS = {
  MOBILE: 768,
  // ... you can define more breakpoints as needed
}
