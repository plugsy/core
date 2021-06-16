
# Auto Docker Dash

A simple dashboard to show you the status of your current docker stack.

https://user-images.githubusercontent.com/2565465/122217617-ddc0db80-cead-11eb-9adb-1365638158a2.mov


## Why?

To display a simple status and list of all of my docker containers.
I've been toying with making myself a proper home dashboard and I think think this is a good start.

_I also wanted to play with GraphQL subscriptions and observables_

## Features

- List all the containers with the given label
- Display the status of the containers
  - Will also show the status of children containers, see [children](#children)
- Ability to add a link to each of the containers

## Getting started

### Step 1
Add a couple of labels to all of your containers you wish to appear on the dashboard.

| Label               | Description                                                                                                                           |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| dockerDash.name     | Name of the container to appear in the dashboard                                                                                      |
| dockerDash.category | Give the category a name under which the container will appear                                                                        |
| dockerDash.icon     | This is an icon that will appear to the left of the container, see [icons](#icons)                                                    |
| dockerDash.link     | A http(s) link to the container, useful if the container is hosting a webpage etc.                                                    |
| dockerDash.parents  | A list of parents associated with this container, must equal what is in dockerDash.name labels. Comma separated for multiple parents. |
|                     |                                                                                                                                       |

### Step 2
Run the container with the `DOCKER_SOCKET` location environment variable. 

Will default to `/var/run/docker.sock`

## Usage

#### Example with docker-compose: 
```
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
      dockerDash.link: https://todo.thenairn.com
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


## Development

Simple enough:

`docker-compose up --build`

### Notes: 

- The development build will not include all of the icons, and will instead generate a static icon instead.
  - This is to reduce the build time. Webpack loading 18,000 dynamic icons is looooooong, any feedback on how to speed that up is appreciated!
- Uses a custom Next.js server built with Parcel
  - This is in order for us to support websockets as Next.js doesn't by default.



### CI:
Based off of [AsyncAPIs blog](https://www.asyncapi.com/blog/automated-releases)