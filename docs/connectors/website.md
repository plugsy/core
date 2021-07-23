# Website Connector

### Basic Example

Can use a list of website urls (And other request formats) for Plugsy to ping and check against a status code or response regex.

**Note**: You must use a full url, including the protocol (`http://`, `https://`... etc)

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v4.0.0/core-config-schema.json",
  "connectors": [
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
    }
  ]
}
```

### Full Connector Config

```jsonc
{
  "$schema": "https://github.com/plugsy/core/releases/download/v4.0.0/core-config-schema.json",
  "connectors": [
    {
      "type": "WEBSITE",
      "config": {
        "sites": [
          {
            "display": {
              "category": "Websites", // Optional, defaults to null. Only optional if using parents.
              "name": "Google", // Required
              "icon": "string", // Optional, defaults to null. See Icons for configuration options
              "link": "string", // Optional, defaults to null.
              "parents": [] // Optional, defaults to []
            },
            "request": "https://google.com", // Required, can be a string or of type request as shown below
            "request": {
              "method": "POST",
              "url": "https://mypostendpoint.com"
            },
            "interval": 20000, // Optional, defaults to 30000. Describes time to ping the requested server in milliseconds
            "requiredBodyRegex": "", // Optional, defaults to null. Useful in order to expect a specfic string to appear in the response.
            "requiredStatusCode": 200 // Optional, defaults to null. Can either be a status code (number) or an array of status codes to expect
          }
        ]
      }
    }
  ]
}
```

For icon options see [/README#Icons](/README#Icons)
