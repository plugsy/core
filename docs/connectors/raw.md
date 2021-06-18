# Raw Connector

### Basic Example

Provides items in the dashboard directly from the config itself

```json
{
  "$schema": "./server/schema/context/item-server/config/schema.json",
  "connectors": [
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

### Full Connector Config

```json
{
  "$schema": "./server/schema/context/item-server/config/schema.json",
  "connectors": [
    {
      "type": "raw",
      "config": {
        "items": [
          {
            "name": "Home Assisant",
            "category": "My Category", // Optional, defaults to null
            "icon": "fi/FiBeer", // Optional, defaults to null
            "link": "https://my.home-assistant.io/", // Optional, defaults to null
            "state": "GREY", // Optional, defaults to null. Valid options: "RED" | "GREEN" | "YELLOW" | "GREY"
            "status": "", //Optional, defaults to null. Status text will appear under the item in the dashboard
            "parents": ["parent"] //Optional, defaults to []
          }
        ]
      }
    }
  ]
}
```

For icon options see [/README#Icons](/README#Icons)
