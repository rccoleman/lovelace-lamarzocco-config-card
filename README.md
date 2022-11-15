# La Marzocco Config Card
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

## Overview

This is a card for [Home Assistant](https://www.home-assistant.io/)'s [Lovelace UI](https://www.home-assistant.io/lovelace) that can be used to display and configure settings for network-connected La Marzocco espresso machines. It requires the La Marzocco custom component, available [here.](https://github.com/rccoleman/lamarzocco)

## Installation

### HACS

This card is available in the default [HACS](https://hacs.xyz) repository, so you can install it this way:

* Launch HACS and click "Frontend"
* Click "+ Explore & Add Repositories" button in the lower-right corner of HACS
* Search for "marzocco" and select the card that appears
* Click "Install this repository"
* Add the following to your configuration.yaml or ensure that the resource is added to Configuration->Lovelace Dashboards->Resources:

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

This card requires that the [La Marzocco custom integration](https://github.com/rccoleman/lamarzocco) has been installed and configured.

This card supports 4 different card types -

- Auto on/off hours (`auto`)
- Prebrew on/off times (`prebrew`)
- Dose in pulses (~0.5ml) (`dose`)
- Hot Water Dose in seconds (`hot_water_dose`)

The machine model is taken into account to determine whether a card type is supported (`dose` is only supported for GS3 AV, for example) or to configure card contents (`prebrew` only displays a single value for the Linea Mini).

The card will automatically find the appropriate entity for the specified `card_type`, so there's no need to supply an `entity_id` in the card config.

Adding the card from the Lovelace "+ Add Card" interface is supported, and the preview of the card will update automatically based on the specified YAML config. There's no support for graphical card editor at this time.

### Auto On/Off

Use `card_type: auto` for the Auto On/Off card variant.

Each day of the week in the Auto On/Off variant is a button that toggles auto on/off for that day of the week.

The values represent hours in the day, with the first number indicating the hour that the machine should turn on and the second number indicating the hour that it should turn off. Both values are based on a 24-hour clock and will accept numbers in the range of 0-23, with the constraint that the "on" time must be lower/earlier than the "off" time.

### Prebrew

Use `card_type: prebrew` for the Prebrew card variant.

Prebrewing can only be enabled or disabled at the machine level (not per key), and each `Key #` header in the Prebrew variant is a button that enables or disables for the machine. Clicking one button will toggle the rest as well to indicate the over all state for the machine.

The values represent the following:

- The first value is the number of seconds that the pump should run when a shot is initiated
- The second value is the number of seconds that the pump should turn off following the first time interval before turning back on for the remainder of the shot.

### Dose

Use `card_type: dose` for the Dose card variant.

The Dose card variant has no toggle functionality and clicking on the `Key #` headers does nothing.

The values represent the volume of water to dispense for each front-panel key in pulses, each roughly 0.5ml.

### Hot Water Dose

Use `card_type: hot_water_dose` for the Hot Water Dose card variant.

The Hot Water Dose card variant has no toggle functionality and clicking on the header does nothing.

The values represent the number of seconds to dispense hot water using the front-panel button.  The default is 8s.

### Preinfusion

Use `card_type: preinfusion` for the Preinfusion card variant.

Preinfusion can only be enabled or disabled at the machine level (not per key), and each `Key #` header in the Prebrew variant is a button that enables or disables for the machine. Clicking one button will toggle the rest as well to indicate the over all state for the machine.

The value represents the amount of preinfusion time in seconds before the pump turns on.  The allowable range is 0-24.9s.

## Default configuration

### Auto On/Off Hours

![Auto On/Off Hours](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/AutoOnOff-default.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: auto
```

### Prebrew on/off times

![Prebrew On/Off Hours](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Prebrew-default.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: prebrew
```

### Dose (only for GS3 AV)

![Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Dose-default.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: dose
```

### Hot Water Dose (only for GS3 AV and MP)

![Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/hot-water-dose-default.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: hot_water_dose
```

### Preinfusion (only for GS3 AV and LM)

![Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Preinfusion.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: preinfusion
```

## Customized cards

These are examples of each card variant with some additional styling using the [`card-mod` plugin](https://github.com/thomasloven/lovelace-card-mod)

### Auto On/Off Hours

![Auto On/Off Hours](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/AutoOnOff.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: auto
  name: Auto On/Off Hours
  style: |
    ha-card {
      background-color: var(--primary-background-color);
      --lamarzocco-config-elements-background-color: var(--primary-background-color);
    }
```

### Prebrew on/off times

![Prebrew On/Off Hours](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Prebrew.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: prebrew
  name: Prebrew Times
  style: |
    ha-card {
      background-color: var(--primary-background-color);
      --lamarzocco-config-elements-background-color: var(--primary-background-color);
    }
```

### Dose (only for GS3 AV)

![Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Dose.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: dose
  name: Dose
  style: |
    ha-card {
      background-color: var(--primary-background-color);
      --lamarzocco-config-elements-background-color: var(--primary-background-color);
    }
```

### Hot Water Dose (only for GS3 AV and MP)

![Hot Water Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/hot-water-dose-custom.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: hot_water_dose
  name: Hot Water Dose
  style: |
    ha-card {
      background-color: var(--primary-background-color);
      --lamarzocco-config-elements-background-color: var(--primary-background-color);
    }
```

### Preinfusion (only for GS3 AV and LM)

![Hot Water Dose](https://raw.github.com/rccoleman/lovelace-lamarzocco-config-card/master/examples/Preinfusion.png)

YAML config:

```yaml
- type: 'custom:lamarzocco-config-card'
  card_type: preinfusion
  name: Preinfusion
  style: |
    ha-card {
      background-color: var(--primary-background-color);
      --lamarzocco-config-elements-background-color: var(--primary-background-color);
    }
```

## Options

| Name      | Type   | Requirement  | Description                                                   | Default                  |
| --------- | ------ | ------------ | ------------------------------------------------------------- | ------------------------ |
| type      | string | **Required** | `custom:lamarzocco-config-card`                               | None                     |
| card_type | string | **Required** | Must be one of `auto`, `prebrew`, `dose`, or `hot_water_dose` | None                     |
| name      | string | **Optional** | Card name                                                     | Entity's `friendly_name` |
| hide      | object | **Optional** | Hide object                                                   | None                     |

### Hide Object

| Name | Type    | Requirement  | Description         | Default |
| ---- | ------- | ------------ | ------------------- | ------- |
| name | boolean | **Optional** | Hides the card name | `false` |

### Theme Variables

La Marzocco Config Card will automatically pick up colors from your lovelace theme, but if you want to customize some of them,
you can use the following variables in your theme's config file or with [card-mod](https://github.com/thomasloven/lovelace-card-mod) styles:

| Name                                        | Default                        | Description                            |
| ------------------------------------------- | ------------------------------ | -------------------------------------- |
| lamarzocco-config-elements-background-color | `var(--primary-color)`         | Background color for header and inputs |
| lamarzocco-config-icon-color                | `var(--primary-text-color)`    | Arrow color                            |
| lamarzocco-config-text-color                | `white`                        | Text color                             |
| lamarzocco-config-border-radius             | `var(--ha-card-border-radius)` | Border radius of the card              |
| lamarzocco-config-border-color              | `var(--primary-color)`         | Border color for the input box         |
