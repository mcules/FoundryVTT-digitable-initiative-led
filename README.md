# Initiative LED Plugin for Foundry VTT
This Foundry VTT plugin, allows you to control LED's connected to an ESP8266 / ESP32 using the [WLED Firmware](https://kno.wled.ge/).

With this plugin you can assign LEDs to the seats of your teammates. The LED's can be integrated into your tabletop gaming experience to provide a visual representation of initiative order.

## Hardware
I used an SK6812 stripe with six LED's and a ESP32 controller.

Of course you can use all LEDs and controllers (supported by WLED).
The WLED page explains the exact hardware installation better than I could here, which is why I refer you to their [quick start](https://kno.wled.ge/basics/getting-started/).

Once you have the hardware ready, all you need is the IP address of the WLED controller and you can continue.

## Installation
1. Clone or download this repository into the `modules` directory of your Foundry VTT installation.
   git clone https://github.com/mcules/FoundryVTT-digitable-initiative-led
2. Restart your Foundry VTT server.

## Setup
1. Enable the "Digitable Initiative LED" module in the Foundry VTT setup.
2. Configure the plugin in Foundry VTT by providing the IP address of you're WLED controller.
3. In the actor list you now have a new icon to specify the seats of the respective actor. If no seat was specified for an actor, the DM's seat is automatically used for the display.

When you start an initiative, the character whose turn it is will be displayed at the assigned seat 