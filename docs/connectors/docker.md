# Docker Connector

### Basic Example

A docker connector, provides access directly to a docker socket or URL mapping each container to an item on the dashboard using labels

```jsonc
{
  "$schema": "https://github.com/Inlustra/auto-docker-dash/releases/download/v2.1.0/schema.json",
  "connectors": [
    {
      "type": "docker",
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
  autodockerdash:
    image: inlustra/autodockerdash
    container_name: autodockerdash
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
      dockerDash.icon: "fi/FiDatabase"
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
      dockerDash.icon: "fi/FiServer"

  vikunjafrontend:
    image: vikunja/frontend
    container_name: vikunjafrontend
    restart: unless-stopped
    labels:
      dockerDash.name: "Todo"
      dockerDash.category: "Home"
      dockerDash.icon: "fi/FiPenTool"
      dockerDash.link: https://my.vikunja.com
```

### Example usage with docker-compose and config file:

```yml
---
version: "2.1"
services:
  autodockerdash:
    image: inlustra/autodockerdash
    container_name: autodockerdash
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
  "$schema": "https://github.com/Inlustra/auto-docker-dash/releases/download/v2.1.0/schema.json",
  "connectors": [
    {
      "type": "docker",
      "config": {
        "containerMap": {
          "vikunjafrontend": {
            "name": "Vikunja",
            "category": "Home",
            "icon": "fi/FiPenTool",
            "link": "https://my.vikunja.com"
          },
          "vikunjaapi": {
            "name": "API",
            "icon": "fi/FiServer",
            "parents": ["Vikunja"]
          },
          "vikunjadb": {
            "name": "DB",
            "icon": "fi/FiDatabase",
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
  "$schema": "https://github.com/Inlustra/auto-docker-dash/releases/download/v2.1.0/schema.json",
  "connectors": [
    {
      "type": "docker",
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
          "name": "dockerDash.name",
          "category": "dockerDash.category",
          "icon": "dockerDash.icon",
          "link": "dockerDash.link",
          "parents": "dockerDash.parents"
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
