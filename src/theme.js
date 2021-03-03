import { createMuiTheme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: grey[100],
        },
      },
    },
  },
});

export default theme;
