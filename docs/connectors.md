# Connectors

Plugsy support various connectors, more connectors can be requested through the issue type.

## Docker

A docker connector, provides access directly to a docker socket or URL mapping each container to an item on the dashboard using labels

[Connector Docs](connectors/docker.md)

## Raw

Provides items in the dashboard directly from the config itself

[Connector Docs](connectors/raw.md)

## Website

Can use a list of website urls (And other request formats) for Plugsy to ping and check against a status code or response regex.

[Connector Docs](connectors/website.md)

# A full example

```
{
  "$schema": "https://github.com/plugsy/core/releases/download/v4.0.0/config-schema.json",
  "connectors": [
    {
      "type": "DOCKER",
      "config": {}
    },
    {
      "type": "WEBSITE",
      "config": {
        "sites": [
          {
            "display": {
              "category": "Websites",
              "name": "Google"
            },
            "request": "https://google.com"
          }
        ]
      }
    },
    {
      "type": "RAW",
      "config": {
        "items": [
          {
            "name": "Home Assistant",
            "category": "Home",
            "link": https://my.home-assistant.io
          }
        ]
      }
    }
  ]
}
```
