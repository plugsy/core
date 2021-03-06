# Docker Connector

### Basic Example

A docker connector, provides access directly to a docker socket or URL mapping each container to an item on the dashboard using labels

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v7.0.0/core-config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {}
    }
  ]
}
```

### Example usage with docker-compose and labels:

```yml
---
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
      plugsy.name: "DB"
      plugsy.parents: "Todo"
      plugsy.icon: "@styled-icons/feather/Database"
    container_name: vikunjadb
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

  vikunjaapi:
    container_name: vikunjaapi
    image: vikunja/api
    restart: unless-stopped
    labels:
      plugsy.name: "API"
      plugsy.parents: "Todo"
      plugsy.icon: "@styled-icons/feather/Server"

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
    labels:
      plugsy.name: "Todo"
      plugsy.category: "Home"
      plugsy.icon: "@styled-icons/fa-solid/Horse"
      plugsy.link: https://my.vikunja.com
```

### Example usage with docker-compose and config file:

```yml
---
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
    container_name: vikunjadb
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

  vikunjaapi:
    container_name: vikunjaapi
    image: vikunja/api
    restart: unless-stopped

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
```

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v7.0.0/core-config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {
        "containerMap": {
          "vikunjafrontend": {
            "name": "Vikunja",
            "category": "Home",
            "icon": "@svg-icons/bootstrap/Pencil",
            "link": "https://my.vikunja.com"
          },
          "vikunjaapi": {
            "name": "API",
            "icon": "@svg-icons/boxicons-regular/Server",
            "parents": ["Vikunja"]
          },
          "vikunjadb": {
            "name": "DB",
            "icon": "@svg-icons/fa-solid/Database",
            "parents": ["Vikunja"]
          }
        }
      }
    }
  ]
}
```

### Full Connector Config

See [Dockerode](https://www.npmjs.com/package/dockerode) for alternative connection options

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v7.0.0/core-config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {
        "id": "", // Optional defaults to "docker"
        "dockerOptions": {
          // Optional, defaults to { socketPath: '/var/run/docker.sock' }
          // See JSON Schema or for more connection options
          // Allows full
        },
        "interval": "20000", // Optional, Number in milliseconds defaults to 20 seconds
        "labelConfig": {
          // Optional, defaults below
          "name": "plugsy.name",
          "category": "plugsy.category",
          "icon": "plugsy.icon",
          "link": "plugsy.link",
          "parents": "plugsy.parents"
        },
        "containerMap": {
          "container_name": {
            "name": "string", // Required, describes the name that will appear in the item on the frontend
            "category": "string", // Optional if parent is given. Defaults to null
            "icon": "string", // Optional, defaults to null
            "link": "string", // Optional, defaults to null
            "parents": ["parent 1", "parent 2"] // Optional, if category is given, defaults to []
          }
        }
      }
    }
  ]
}
```
