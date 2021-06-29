# Agent Mode

**This is in beta and not well-tested**

### Description

Plugsy now supports agent mode, allowing you to push changes from 1 plugsy container to another. 

This is useful should you have multiple docker/connected environments that you'd like to monitor from a single dashboard.


#### Example use case

![Plugsy Agent Mode Use Case](images/agent-mode.svg)

### How to enable

Simply add the agent section to your configuration file with the location of your other plugsy node.

**Note:** You will have to input the GraphQL endpoint for the plugsy container which is currently at `/graphql`

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v3.0.2/config-schema.json",
  "agent": {
    "endpoint": "http://localhost:3000/graphql"
  }
}
```
