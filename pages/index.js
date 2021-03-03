import Link from "next/link";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Container, Paper } from "@material-ui/core";

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

function IndexPage(props) {
  const classes = useStyle();
  return (
    <Container>
      <Paper classes={{ root: classes.paperStyle }} elevation={1}>
        <div className={classes.buttonPanel}>
          <Link href="/chat" passHref>
            <Button variant="contained" disableElevation>
              Chat
            </Button>
          </Link>
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              props.apolloClient.logout();
            }}
          >
            Logout
          </Button>
        </div>
      </Paper>
    </Container>
  );
}

export default IndexPage;
