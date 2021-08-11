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
- Entirely customisable and themeable
  - Dark mode capable, Dracula example in theming doc
  - See [theming](/docs/theming.md)
- Websocket connections for speedy updates
- Any icon supported in react-icons see [icons](#icons)
- Show children items on your dashboard- Will also show the status of children containers
  - Got a docker container that relies on a website being available? Why not show both!?
  - See [children](#children)
- Docker
  - List all the containers with the given label
  - Display the status of the containers
- Websites
  - Show the status and connectivity of a given website along with a link
  - Variable update interval
- Raw
  - Have some links that don't have any status attached?
  - Use the included file configuration and show any ol' link that you'd like.
- _Agent Mode (New in V3)_: Use multiple plugsy containers to gather local states and push to a different instance to aggregate the statuses
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
      dockerDash.name: "DB"
      dockerDash.parents: "Todo"
      dockerDash.icon: "@styled-icons/feather/Database"
    container_name: vikunjadb
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

  vikunjaapi:
    container_name: vikunjaapi
    image: vikunja/api
    restart: unless-stopped
    labels:
      dockerDash.name: "API"
      dockerDash.parents: "Todo"
      dockerDash.icon: "@styled-icons/feather/Server"

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
    labels:
      dockerDash.name: "Todo"
      dockerDash.category: "Home"
      dockerDash.icon: "@styled-icons/fa-solid/Horse"
      dockerDash.link: https://my.vikunja.com
```

## Configuration

There is now a configuration file that can be optionally added in order to include various connectors (Such as website connections or other arbitrary links). See [connectors](docs/connectors.md)

This file should be mounted at `/config.json` in the container.

**Note**: Including the `$schema` field in the JSON file will help with auto complete in your preferred IDE.

config.json

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v6.0.0-beta.1/core-config-schema.json",
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
            "icon": "@svg-icons/boxicons-regular/Beer"
          },
          {
            "name": "Beer Tab Dependency",
            "state": "GREEN",
            "icon": "@svg-icons/ionicons-solid/Beer",
            "parents": ["Beer Tab"]
          }
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

**NEW IN V6**

We've moved to styled-icons (In particular the svg-icons packages)

You can use any icons available in [styled-icons](https://styled-icons.js.org/).
Super simple, go to the page above, click the icon you would like to use, and use it in your config or docker labels.

Example using docker labels:
`dockerDash.icon: '@svg-icons/simple-icons/Plex'` is to load the `Plex` icon in the [simple-icons](https://styled-icons.js.org/?s=plex) pack
`dockerDash.icon: '@svg-icons/simple-icons/Homeassistant'` is to load the `Homeassistant` icon in the [simple-icons pack](https://styled-icons.js.org/?s=home%20assistant)

Example using config.json:

```jsonc{
"connectors": [
    {
      "type": "DOCKER",
      "config": {
        "containerMap": {
          "plugsy-container-name": {
            "category": "Home",
            "icon": "@svg-icons/boxicons-regular/Crown",
            "name": "Plugsy"
          }
        }
      }
    }
  ]
}
```

##### Icons using a URL 

** NEW IN V6 **

You can now use icons using a URL!


Example using docker labels:
`dockerDash.icon: 'https://symbols.getvecta.com/stencil_82/45_google-icon.d8d982f8a1.png'`

Example using config.json:

```jsonc{
"connectors": [
    {
      "type": "DOCKER",
      "config": {
        "containerMap": {
          "plugsy-container-name": {
            "category": "Home",
            "icon": "https://symbols.getvecta.com/stencil_82/45_google-icon.d8d982f8a1.png",
            "name": "Plugsy"
          }
        }
      }
    }
  ]
}
```

#### Children

In order to show dependent containers, you need only ensure that the item you wish to show has a parents label pointing at the same name as another item.

Example using the [raw connector](docs/connectors/raw.md):

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v6.0.0-beta.1/core-config-schema.json",
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
            "icon": "@svg-icons/boxicons-regular/Beer"
          },
          {
            "name": "Beer Tab Dependency",
            "state": "GREEN",
            "icon": "@svg-icons/ionicons-solid/Beer",
            "parents": ["Beer Tab"]
          }
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
    dockerDash.name: "API"
    dockerDash.parents: "Todo"
    dockerDash.icon: "@styled-icons/feather/Server"

vikunjafrontend:
  image: vikunja/frontend
  container_name: vikunjafrontend
  restart: unless-stopped
  labels:
    dockerDash.name: "Todo"
    dockerDash.category: "Home"
    dockerDash.icon: "@styled-icons/fa-solid/Horse"
    dockerDash.link: https://my.vikunja.com
```

## Development

Simple enough:

`docker-compose up --build`

### Notes

- The development build will not include all of the icons, and will instead generate a static icon instead.
  - This is to reduce the build time. Webpack loading 18,000 dynamic icons is looooooong, any feedback on how to speed that up is appreciated!
- Uses a custom Next.js server
  - This is in order for us to support websockets as Next.js doesn't by default.

### CI

Based off of [AsyncAPIs blog](https://www.asyncapi.com/blog/automated-releases)

# FAQ

#### I can see the status of the connector, but I can't see my containers?

Ensure that a both a category and a name are defined,
if you're using the default docker configuration and labels,
that will require both the `dockerDash.category` and `dockerDash.name` labels on your container.

**Category is required**, you can only omit category when you want the container to appear as a child of another item on the dashboard.
