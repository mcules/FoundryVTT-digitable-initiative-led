/**
 * Digital Table System
 * @typedef {Object} DigiTableInitiativeLED
 * @property {string} id - A unique ID to identify this table.
 * @property {string} label - The text of the todo.
 * @property {boolean} isDone - Marks whether the todo is done.
 * @property {string} userId - The user who owns this todo.
 */
class DigiTableInitiativeLED  {
  static ID = 'FoundryVTT-digitable-initiative-led';
  static initialize() {
    this.settings();

    this.seats_power = {
      0: {"on":false,"bri":255},
      1: {"on":true,"bri":255}
    };

    this.seats_off = {"seg":{"i":[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]}};

    this.seats = {
      0: {"seg":{"i":[[255,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]}},
      1: {"seg":{"i":[[0,0,0],[255,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]}},
      2: {"seg":{"i":[[0,0,0],[0,0,0],[255,0,0],[0,0,0],[0,0,0],[0,0,0]]}},
      3: {"seg":{"i":[[0,0,0],[0,0,0],[0,0,0],[255,0,0],[0,0,0],[0,0,0]]}},
      4: {"seg":{"i":[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[255,0,0],[0,0,0]]}},
      5: {"seg":{"i":[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[255,0,0]]}}
    };

    this.httpPost(game.settings.get(this.ID, 'wled-uri'), this.seats_power[1]).then();
    this.httpPost(game.settings.get(this.ID, 'wled-uri'), this.seats_off).then();
  }
  static set_actor_led(actorId) {
    let seatId = game.settings.get("FoundryVTT-digitable-initiative-led", 'actor-seats')[actorId];
    if (seatId === undefined) {
      seatId = 0;
    }

    this.httpPost(game.settings.get(this.ID, 'wled-uri'), this.seats[seatId]);
  }
  static async httpPost(url, values) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error(`Error during POST request: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  static settings() {
    // Set wled-ip
    game.settings.register(this.ID, "wled-ip", {
      name: this.ID + `.settings.wled-ip.Name`,
      hint: this.ID + `.settings.wled-ip.Hint`,
      scope: 'world',
      config: true,
      type: String,
      default: "",
      onChange: value => {
        game.settings.set(this.ID, 'wled-uri', "http://" + value + "/json");
      },
    });

    // Set wled-uri
    game.settings.register(this.ID, "wled-uri", {
      scope: 'world',
      config: false,
      type: String,
      default: "http://" + game.settings.get(this.ID, 'wled-ip') + "/json",
    });

    // Set DM Seat ID
    game.settings.register(this.ID, "dm-seat", {
      name: this.ID + `.settings.dm-seat.Name`,
      hint: this.ID + `.settings.dm-seat.Hint`,
      scope: 'world',
      config: true,
      type: Number,
      default: 0,
    });

    // This setting includes the assignment of characters and seats
    game.settings.register(this.ID, "actor-seats", {
      scope: 'world',
      config: false,
      type: Object,
      default: {}
    });
  }
}

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(DigiTableInitiativeLED .ID);
});

Hooks.once('init', () => {
  DigiTableInitiativeLED .initialize();
});

Hooks.on('renderActorDirectory', (app, html) => {
  // check if current user is Game Master
  if (game.user.isGM) {
    const btnSettings = $(`<button type='button' class='digitable-initiative-led-button flex0' title="${tooltip}"><i class='fa-solid fa-hand-fist'></i></button>`);
    html.find(".directory-list .actor").append(btnSettings);
    html.on('click', '.digitable-initiative-led-button', (event) => {
      const actorId = event.currentTarget.closest('.actor').dataset.documentId
      let applyChanges = false;
      let current_seat = game.settings.get("FoundryVTT-digitable-initiative-led", 'actor-seats')[actorId];
      if (current_seat === undefined) {
        current_seat = 0;
      }

      new Dialog({
        title: game.i18n.localize("FoundryVTT-digitable-initiative-led.settings.Actor.Title"),
        content: `
    <form>
      <div class="form-group">
        <label>`+ game.i18n.localize("FoundryVTT-digitable-initiative-led.settings.Actor.Seat.Name") +`:</label>
        <input type='text' name='seatID' value="`+ current_seat +`">
      </div>
    </form>`,
        buttons: {
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("FoundryVTT-digitable-initiative-led.Button.Save"),
            callback: () => applyChanges = true
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("FoundryVTT-digitable-initiative-led.Button.Chancel")
          },
        },
        default: "no",
        close: html => {
          if (applyChanges) {
            let seatID = html.find('[name=seatID]')[0].value || "none";
            let actor_seats = game.settings.get("FoundryVTT-digitable-initiative-led", 'actor-seats');
            actor_seats[actorId] = seatID;
            game.settings.set("FoundryVTT-digitable-initiative-led", 'actor-seats', actor_seats);
          }
        }
      }).render(true);
    });
  }
});

Hooks.on("updateCombat", (combat, data) => {
  if (data.turn !== undefined && data.turn !== combat.previous.turn) {
    DigiTableInitiativeLED.set_actor_led(combat.combatant.actorId);
  }
});
