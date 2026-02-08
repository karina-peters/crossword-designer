// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    projectId: "crossword-designer",
    appId: "1:648994652524:web:ff927286d254a5ae767349",
    storageBucket: "crossword-designer.appspot.com",
    apiKey: "AIzaSyAeO3vr4FVIzeiKez9hOpn8EBmQeltUsBI",
    authDomain: "crossword-designer.firebaseapp.com",
    messagingSenderId: "648994652524",
    measurementId: "G-D5NKPKN158",
  },
  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export const TestPuzzle = {
  name: "Stitchin' Time",
  createdBy: "test-user-id",
  lastEdited: new Date(Date.now()),
  size: 21,
  width: 21,
  height: 21,
  locked: false,
  public: false,
  answers:
    "yesandnonasalactividitaroditprothamespartnerincrimelalalamernohitblankcdsaidetessartistscheckindeskdryginfosterdadhueencamplotatonassetsgijoeacerwaitinlineramsthreatsouleurocratshoesleepgaulredpandanyetsiestaoreoendintearsskisamensafroeduclaoakrapduaeatstrikeoneinniesmotherinlawspendernopewanttonkatsuaccraereelninobackinbusinesspounceegretinastatesidedreedstothemax".split(
      ""
    ),
  spacers: [
    8, 14, 20, 29, 35, 56, 63, 67, 68, 69, 75, 84, 85, 86, 91, 96, 97, 116, 123, 124, 125, 135, 136, 140, 150, 155, 162, 172, 173, 195, 200,
    201, 210, 184, 211, 212, 217, 223, 228, 229, 230, 239, 240, 245, 256, 267, 268, 278, 285, 290, 300, 304, 305, 315, 316, 317, 324, 343,
    344, 349, 354, 355, 356, 365, 371, 372, 373, 377, 384, 405, 411, 420, 426, 432,
  ],
  circles: [26],
  shades: [],
  "across-clues": [
    "It's not that simple",
    "Kind of passage",
    "When Juliet drinks the potion",
    "Race held annually in early March",
    "Computer expert, for short",
    "Reading can be found on it",
    "Bigamy, legally speakin'?",
    "[I forgot the words...]",
    "Eau so big?",
    "Stellar, as a pitching outing",
    "Pirate fodder, once",
  ],
  "down-clues": [
    "Sharp bark",
    "Product typically wrapped in paraffin wax",
    "Father",
    "Draw",
    "Grams in Britain?",
    "Beats Electronics co-founder, familiarly",
    "Winter Olympics powerhouse: Abbr.",
    "Wednesday eponym",
    "Specialty segments",
    "Liable to be lost",
    "Emits sparks, as a campfire",
    "Stick for a snowman, say",
    "Auto racing champion Sebastien",
    "Yet to be apprehended",
    "Some protest activity",
    "Bubbles featurin' comic-book dialog?",
    "Products with screens...or a homophone of a type of big screen",
    "South African grassland",
    "Mouthing off",
  ],
};
