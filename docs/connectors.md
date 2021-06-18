# Connectors

Auto Dash support various connectors, more connectors can be requested through the issue type.

## Docker

A docker connector, provides access directly to a docker socket or URL mapping each container to an item on the dashboard using labels

[Connector Docs](connectors/docker.md)

## Raw

Provides items in the dashboard directly from the config itself

[Connector Docs](connectors/raw.md)

## Website

Can use a list of website urls (And other request formats) for Auto Dash to ping and check against a status code or response regex.

[Connector Docs](connectors/website.md)

# A full example

```
{
  "$schema": "https:\/\/github\.com\/Inlustra\/auto-docker-dash\/releases\/download\/v2.1.0\/schema\.json",
  "connectors": [
    {
      "type": "docker",
      "config": {}
    },
    {
      "type": "website",
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
      "type": "raw",
      "config": {
        "items": [
          {
            "name": "Home Assistant",
            "category": "Home",
            "link": "https://home.thenairn.com"
          }
        ]
      }
    }
  ]
}
```
