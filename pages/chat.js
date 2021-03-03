import { useCallback, useRef } from "react";
import Link from "next/link";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Container, Paper } from "@material-ui/core";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";

const messageAdded = gql`
  subscription messageSub {
    messageSub {
      channelId
      messageAdded {
        id
        text
      }
    }
  }
`;
const channelAdded = gql`
  subscription channelAdded {
    channelAdded {
      id
      name
      messages {
        id
        text
      }
    }
  }
`;
const getChannels = gql`
  query getChannels {
    channels {
      id
      name
      messages {
        id
        text
      }
    }
  }
`;
const addChannel = gql`
  mutation addChannel($name: String!) {
    addChannel(name: $name) {
      id
      name
      messages {
        id
        text
      }
    }
  }
`;
const addMessage = gql`
  mutation addMessage($text: String!, $channelId: ID!) {
    addMessage(message: { text: $text, channelId: $channelId }) {
      id
      text
    }
  }
`;

const onMessage = function onSubscriptionData(options) {
  const { client, subscriptionData } = options;
  try {
    const dataInStore = client.readQuery({
      query: getChannels,
    });
    const messageSub = subscriptionData?.data?.messageSub;
    const channels = dataInStore?.channels;
    if (!messageSub || !channels) return;
    const { channelId, messageAdded } = messageSub;
    client.writeQuery({
      query: getChannels,
      data: {
        ...dataInStore,
        channels: channels.map((c) =>
          c.id === channelId
            ? { ...c, messages: [...c.messages, messageAdded] }
            : c
        ),
      },
    });
  } catch (e) {
    return console.log(e);
  }
};

const onChannel = function onSubscriptionData(options) {
  const { client, subscriptionData } = options;
  try {
    const dataInStore = client.readQuery({
      query: getChannels,
    });
    let channels = dataInStore?.channels;
    let channelAdded = subscriptionData?.data?.channelAdded;
    if (!channels || !channelAdded) return;
    client.writeQuery({
      query: getChannels,
      data: {
        ...dataInStore,
        channels: [...channels, channelAdded],
      },
    });
  } catch (e) {
    return console.log(e);
  }
};

const Channel = function Channel(props) {
  const { c, addMessageMutation } = props;
  const msgRef = useRef();
  const onAddMessage = useCallback(() => {
    addMessageMutation({
      variables: {
        text: msgRef.current.value,
        channelId: c.id,
      },
    });
  }, [addMessageMutation, msgRef, c]);

  return (
    <div>
      <h1>{c?.name}</h1>
      {c.messages?.map((m) => (
        <div key={m?.id}>{m?.text}</div>
      ))}
      <div>
        <input placeholder="msg" type="text" ref={msgRef} />
        <Button onClick={onAddMessage}>Add message</Button>
      </div>
    </div>
  );
};

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

export default function ChatPage() {
  useSubscription(messageAdded, {
    onSubscriptionData: onMessage,
  });
  useSubscription(channelAdded, {
    onSubscriptionData: onChannel,
  });
  const channelsQuery = useQuery(getChannels);
  const [addChannelMutation] = useMutation(addChannel);
  const [addMessageMutation] = useMutation(addMessage);
  const channelName = useRef();
  const classes = useStyle();

  return (
    <Container>
      <Paper classes={{ root: classes.paperStyle }} elevation={1}>
        <Link href="/" passHref>
          <Button>Back</Button>
        </Link>
        {channelsQuery.data?.channels?.map((c) => (
          <Channel key={c.id} c={c} addMessageMutation={addMessageMutation} />
        ))}
        <div>
          <input placeholder="channel name" type="text" ref={channelName} />
          <Button
            onClick={() => {
              addChannelMutation({
                variables: {
                  name: channelName.current.value || "Test channel",
                },
              });
            }}
          >
            Add Channel
          </Button>
        </div>
      </Paper>
    </Container>
  );
}
