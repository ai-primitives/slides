import 'styled-components'

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    text: string;
    heading: string;
  };
  fontSizes: {
    text: string;
    heading: string;
  };
}

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
