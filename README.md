# La Marzocco Config Card

## Overview

This is a card for [Home Assistant](https://www.home-assistant.io/)'s [Lovelace UI](https://www.home-assistant.io/lovelace) that can be used to display and configure settings for network-connected La Marzocco espresso machines.

## Installation

### HACS

Install using [HACS](https://hacs.xyz) and add the following to your config:

```yaml
resources:
  - url: /hacsfiles/lovelace-lamarzocco-config-card/lamarzocco-config-card.js
    type: module
```

### Manual

Download lamarzocco-config-card.js from the [latest realease](https://github.com/rccoleman/lovelace-lamarzocco-config-card/releases/latest) and place it in your `config/www` folder. Add the following to your config:

```yaml
resources:
  - url: /local/lamarzocco-config-card.js
    type: module
```

## Usage

## Examples

### Default config - card name shown, 24 hour mode

![Default theme with card name](https://raw.githubusercontent.com/GeorgeSG/lovelace-time-picker-card/master/examples/default_with_name.png)

```yaml
type: 'custom:time-picker-card'
entity: input_datetime.alarm_time
```

### Custom config - hidden card name, 12 hour mode

![Default theme with no card name](https://raw.githubusercontent.com/GeorgeSG/lovelace-time-picker-card/master/examples/default_without_name.png)

```yaml
type: 'custom:time-picker-card'
entity: input_datetime.alarm_time
hour_mode: 12
hide:
  name: true
```

### Custom config - hidden card name, 12 hour mode with a "single" hour mode picker

![Default theme with single hour mode](https://raw.githubusercontent.com/GeorgeSG/lovelace-time-picker-card/master/examples/single_hour_mode.png)

```yaml
type: 'custom:time-picker-card'
entity: input_datetime.alarm_time
hour_mode: 12
layout:
  hour_mode: single
hide:
  name: true
```

### Custom config - card name inside card and controls aligned right

![Default theme with single hour mode](https://raw.githubusercontent.com/GeorgeSG/lovelace-time-picker-card/master/examples/name_inside.png)

```yaml
type: 'custom:time-picker-card'
entity: input_datetime.alarm_time
layout:
  name: inside
  align_controls: right
```

### With a custom lovelace theme

![Custom theme](https://raw.githubusercontent.com/GeorgeSG/lovelace-time-picker-card/master/examples/custom.png)

## Options

| Name   | Type   | Requirement  | Description                                                                                               | Default                  |
| ------ | ------ | ------------ | --------------------------------------------------------------------------------------------------------- | ------------------------ |
| type   | string | **Required** | `custom:time-picker-card`                                                                                 |                          |
| entity | string | **Required** | [Input Datetime](https://www.home-assistant.io/integrations/input_datetime/) entity with `has_time: true` |                          |
| name   | string | **Optional** | Card name                                                                                                 | Entity's `friendly_name` |
| layout | object | **Optional** | Card Layout configuration                                                                                 | `none`                   |
| hide   | object | **Optional** | Hide object                                                                                               | `none`                   |

### Layout Object

| Name     | Value              | Requirement  | Description                                                                | Default  |
| -------- | ------------------ | ------------ | -------------------------------------------------------------------------- | -------- |
| name     | `header`, `inside` | **Optional** | Whether to show the name as a header or inside the card                    | `header` |
| embedded | boolean            | **Optional** | Render with embedded style - disables padding, box shadow, and card header | `false`  |

### Hide Object

| Name | Type    | Requirement  | Description         | Default |
| ---- | ------- | ------------ | ------------------- | ------- |
| name | boolean | **Optional** | Hides the card name | `false` |

### Theme Variables

Time Picker Card will automatically pick up colors from your lovelace theme, but if you want to customize some of them,
you can use the following variables in your theme's config file:

| Name                                  | Default                        | Description                            |
| ------------------------------------- | ------------------------------ | -------------------------------------- |
| time-picker-elements-background-color | `var(--primary-color)`         | Background color for header and inputs |
| time-picker-icon-color                | `var(--primary-text-color)`    | Arrow color                            |
| time-picker-text-color                | `white`                        | Text color                             |
| time-picker-accent-color              | `var(--primary-color)`         | AM / PM active color                   |
| time-picker-off-color                 | `var(--disabled-text-color)`   | AM / PM inactive color                 |
| time-picker-border-radius             | `var(--ha-card-border-radius)` | Border radius of the card              |

[maintenance-link]: https://github.com/GeorgeSG/lovelace-time-picker-card
[license-shield]: https://img.shields.io/github/license/GeorgeSG/lovelace-time-picker-card?color=brightgreen
[license-link]: https://github.com/GeorgeSG/lovelace-time-picker-card/blob/master/LICENSE
[github-icon]: http://i.imgur.com/9I6NRUm.png
[github-link]: https://github.com/GeorgeSG/
[twitter-icon]: http://i.imgur.com/wWzX9uB.png
[twitter-link]: https://twitter.com/georgesg92
