## [7.0.0](https://github.com/plugsy/core/compare/v6.1.0...v7.0.0) (2021-11-30)


### ⚠ BREAKING CHANGES

* Docker container labels have been renamed:

from: dockerDash.*
to: plugsy.*

example:
    plugsy.name: "Todo"
    plugsy.category: "Home"
    plugsy.icon: "@styled-icons/fa-solid/Horse"
    plugsy.link: https://my.vikunja.com

* Bump to V7 ([1b3090a](https://github.com/plugsy/core/commit/1b3090ae99a36707c9436e75c0bda10d8d35b6da))

## [6.0.0](https://github.com/plugsy/core/compare/v5.0.1...v6.0.0) (2021-08-11)


### ⚠ BREAKING CHANGES

* Environment variables have been changed from DOCKER_DASH_ to PLUGSY_
* react-icons are no longer supported and will need to be moved over to the new icon format.

### Features

* Allow icons to be loaded externally ([1f3abbb](https://github.com/plugsy/core/commit/1f3abbb1394f8f20e89934f7a042baed8dd5ddba))
* Build core with armv7 ([7e8c9f9](https://github.com/plugsy/core/commit/7e8c9f90fc3e5c043db14e1ec2d1cf8565080ae6))
* enable beta builds and multiple platforms docker ([da9f856](https://github.com/plugsy/core/commit/da9f856efb74ac1b3c4bd003b90f789a7c0554a3))
* Fully move to styled-icons ([a6a4c0f](https://github.com/plugsy/core/commit/a6a4c0ffbb8f4f66526bfa9533c95463e192c155))
* Plugsy agent endpoint can be specified using environment variables ([6f7ecd4](https://github.com/plugsy/core/commit/6f7ecd467912afb28b84d3ee243088339c99da9f))


### Bug Fixes

* Display error svg if invalid icon supplied ([29099d2](https://github.com/plugsy/core/commit/29099d2a820c4b1ea2fe72a1c15e2765acda16fa))


### Miscellaneous Chores

* Change environment variables from DOCKER_DASH to PLUGSY ([cf74932](https://github.com/plugsy/core/commit/cf74932e6d5b132982475f79974d80c7542d49ee))

## [6.0.0-beta.1](https://github.com/plugsy/core/compare/v5.1.0-beta.1...v6.0.0-beta.1) (2021-08-09)


### ⚠ BREAKING CHANGES

* react-icons are no longer supported and will need to be moved over to the new icon format.

### Features

* Allow icons to be loaded externally ([1f3abbb](https://github.com/plugsy/core/commit/1f3abbb1394f8f20e89934f7a042baed8dd5ddba))
* Build core with armv7 ([7e8c9f9](https://github.com/plugsy/core/commit/7e8c9f90fc3e5c043db14e1ec2d1cf8565080ae6))
* Fully move to styled-icons ([a6a4c0f](https://github.com/plugsy/core/commit/a6a4c0ffbb8f4f66526bfa9533c95463e192c155))


### Bug Fixes

* Display error svg if invalid icon supplied ([29099d2](https://github.com/plugsy/core/commit/29099d2a820c4b1ea2fe72a1c15e2765acda16fa))

### [5.0.1](https://github.com/plugsy/core/compare/v5.0.0...v5.0.1) (2021-07-23)


### Bug Fixes

* github releases and production icons ([053621b](https://github.com/plugsy/core/commit/053621b218aac5cff97dba017293f06edf602914))
