import { useRef } from "react";
import cookie from "cookie";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Container, Paper } from "@material-ui/core";
import redirect from "../src/redirect";

const useStyle = makeStyles((theme) => ({
  paperStyle: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
  },
  buttonPanel: {
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
}));

function SigninPage(props) {
  const classes = useStyle();
  const tokenRef = useRef();
  return (
    <Container>
      <Paper classes={{ root: classes.paperStyle }} elevation={1}>
        <div className={classes.buttonPanel}>
          <input type="text" ref={tokenRef} placeholder="Token" />
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              document.cookie = cookie.serialize(
                "token",
                tokenRef.current.value,
                {
                  maxAge: 30 * 24 * 60 * 60, // 30 days
                }
              );
              props.apolloClient.clear();
              redirect(null, `/`);
            }}
          >
            Set token
          </Button>
        </div>
      </Paper>
    </Container>
  );
}

export default SigninPage;
