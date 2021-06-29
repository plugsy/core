# Plugsy 

![Plugsy Logo](docs/responsive-color-logo.svg)

A simple dashboard used to show the status of various connected pieces of software.

The video below showcases a single docker socket connection (But it does much more than docker!)

https://user-images.githubusercontent.com/2565465/123544521-efc73780-d753-11eb-9d79-ca176320fe2e.mov

## Why?

To display a simple status and list of all of my docker containers.
I've been toying with making myself a proper home dashboard and I think think this is a good start.

_I also wanted to play with GraphQL subscriptions and observables_

And this has since grown into something that can give an up to date status on various different connectors.

## Features

- Links for every item on the dashboard!
- Websocket connections for speedy updates
- Any icon supported in react-icons see [icons](#icons)
- Show children items on your dashboard- Will also show the status of children containers
  - Got a docker container that relies on a website being available? Why not show both!?
  - see [children](#children)
- Docker
  - List all the containers with the given label
  - Display the status of the containers
- Websites
  - Show the status and connectivity of a given website along with a link
  - Variable update interval
- Raw
  - Have some links that don't have any status attached?
  - Use the included file configuration and show any ol' link that you'd like.
- *Agent Mode (New in V3)*: Use multiple plugsy containers to gather local states and push to a different instance to aggregate the statuses
  - Particularly useful if you have docker instances hosted on different machines or behind firewalls etc
  - See [Agent Mode](/docs/agent-mode.md)

## Usage

#### Simplest usage using only a docker socket

docker-compose.yml:

```yml
version: "2.1"
services:

  plugsy:
    image: plugsy/core
    container_name: plugsy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - 3000:3000
    restart: unless-stopped


  vikunjadb:
    image: mariadb:10
    labels:
      dockerDash.name: 'DB'
      dockerDash.parents: 'Todo'
      dockerDash.icon: 'fi/FiDatabase'
    container_name: vikunjadb
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

  vikunjaapi:
    container_name: vikunjaapi
    image: vikunja/api
    restart: unless-stopped
    labels:
      dockerDash.name: 'API'
      dockerDash.parents: 'Todo'
      dockerDash.icon: 'fi/FiServer'

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
    labels:
      dockerDash.name: 'Todo'
      dockerDash.category: 'Home'
      dockerDash.icon: 'fi/FiPenTool'
      dockerDash.link: https://my.vikunja.com
```

## Configuration

There is now a configuration file that can be optionally added in order to include various connectors (Such as website connections or other arbitrary links). See [connectors](docs/connectors.md)

This file should be mounted at `/config.json` in the container.

**Note**: Including the `$schema` field in the JSON file will help with auto complete in your preferred IDE.

config.json

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v3.0.2/config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {}
    },
    {
      "type": "RAW",
      "config": {
        "id": "file",
        "items": [
          {
            "category": "Other",
            "name": "Beer Tab",
            "state": "GREEN",
            "icon": "fi/FiBeer"
          },
          {
            "name": "Beer Tab Dependency",
            "state": "GREEN",
            "icon": "fi/FiBeer",
            "parents": ["Beer Tab"]
          },
        ]
      }
    }
  ]
}
```

docker-compose.yml:
```yml
version: "2.1"
services:

  plugsy:
    image: plugsy/core
    container_name: plugsy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config.json:/config.json
    ports:
      - 3000:3000
    restart: unless-stopped
```

#### Icons

You can use any icons available in [react-icons](https://react-icons.github.io/react-icons/)
I recommend keeping the amount of icon packs used to a minimum to ensure a speedy delivery of
your dashboard

Example:
`dockerDash.icon: 'fi/FiPenTool'` is to load the `FiPenTool` icon in the [feather pack](https://react-icons.github.io/react-icons/icons?name=fi)
`dockerDash.icon: 'md/MdAlarm'` is to load the `MdAlarm` icon in the [Material Design pack](https://react-icons.github.io/react-icons/icons?name=md)

You can get the name of the pack looking at the url for the individual pack.
`https://react-icons.github.io/react-icons/icons?name=fi`

#### Children

In order to show dependent containers, you need only ensure that the item you wish to show has a parents label pointing at the same name as another item.


Example using the [raw connector](docs/connectors/raw.md):

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v3.0.2/config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {}
    },
    {
      "type": "RAW",
      "config": {
        "id": "file",
        "items": [
          {
            "category": "Other",
            "name": "Beer Tab",
            "state": "GREEN",
            "icon": "fi/FiBeer"
          },
          {
            "name": "Beer Tab Dependency",
            "state": "GREEN",
            "icon": "fi/FiBeer",
            "parents": ["Beer Tab"]
          },
        ]
      }
    }
  ]
}
```

An example of the same logic being applied using the [docker connector](docs/connectors/docker.md) docker-compose.yml can be shown below:

```yml
  vikunjaapi:
    container_name: vikunjaapi
    image: vikunja/api
    restart: unless-stopped
    labels:
      dockerDash.name: 'API'
      dockerDash.parents: 'Todo'
      dockerDash.icon: 'fi/FiServer'

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
    labels:
      dockerDash.name: 'Todo'
      dockerDash.category: 'Home'
      dockerDash.icon: 'fi/FiPenTool'
      dockerDash.link: https://my.vikunja.com
```


## Development

Simple enough:

`docker-compose up --build`

### Notes

- The development build will not include all of the icons, and will instead generate a static icon instead.
  - This is to reduce the build time. Webpack loading 18,000 dynamic icons is looooooong, any feedback on how to speed that up is appreciated!
- Uses a custom Next.js server built with Parcel
  - This is in order for us to support websockets as Next.js doesn't by default.

### CI

Based off of [AsyncAPIs blog](https://www.asyncapi.com/blog/automated-releases)

# FAQ

#### I can see the status of the connector, but I can't see my containers? 

Ensure that a both a category and a name are defined, 
if you're using the default docker configuration and labels, 
that will require both the `dockerDash.category` and `dockerDash.name` labels on your container.

**Category is required**, you can only omit category when you want the container to appear as a child of another item on the dashboard.
