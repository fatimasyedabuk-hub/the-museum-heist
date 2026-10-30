# The Museum Heist
*An interactive mystery. Six scenes. One stolen painting. Can you uncover the truth?*

**CCT 360 · Interactive Discovery group project (The Curious Case)**
**Group:** Fatima Bukhari · Lama Hamdan · Dima Hamdan
**Live website:** https://fatimasyedabuk-hub.github.io/the-museum-heist/

## Story and content
Story, clue wording, dialogue, unlock rules and endings follow the team's Story Bible (written by Lama Hamdan).

## Concept
The player is a detective. *The Moonlit Garden*, the centrepiece of a museum, has been stolen with no alarm and no forced door.
By exploring rooms, collecting clues, reviewing CCTV and interviewing three suspects, the player decides who did it.
The accusation has to be earned from evidence, and the ending changes with who is accused and how much evidence was found.

## Scenes
1. **Introduction:** sets the mystery and starts the investigation.
2. **Investigation Board:** the hub for the suspects, the four clue cards and navigation to every room.
3. **Gallery:** clickable hotspots on the plaque, frame, trolley and guest book; the Gallery Plaque, Transfer Slip and Frame Fabric clues are found here.
4. **Security Room:** a three-frame CCTV player (Next Frame), the Badge Log, a restart notice and a guard report.
5. **Suspect Interviews:** question Mara Vale, Iris Chen and Leo Grant. Challenge prompts unlock when the matching clue is saved.
6. **Final Reveal:** locked until the plaque, badge log and transfer slip are saved. Accuse a suspect, confirm, then see the ending.

## How to run
Open `index.html` in any modern browser. No build step, server or internet connection is needed (fonts fall back to
Georgia and system sans-serif if offline). Progress is saved in the browser (`localStorage`);
use **Start over** on the first scene (or **Restart** on the final screen) to reset.

## Project structure
```
index.html          page shell (semantic HTML)
css/styles.css      all styling, responsive at 760px
js/app.js           all interaction and state
assets/images/      16 scene, suspect, clue and CCTV images
assets/icons/       6 navigation icons
CREDITS.md          source and attribution for every image, icon and font
```

## Requirements map
| Requirement | How it is met |
|---|---|
| 4–6 interconnected scenes | 6 scenes, all reachable from the navigation bar |
| ≥ 5 interactive elements | Clue cards with detail modals, gallery hotspots, CCTV feed tabs, interview questions, suspect and accusation cards, restart |
| ≥ 2 state-based interactions | Collected clues, viewed feeds and asked questions are remembered; interview challenges unlock with matching clues and the Final Reveal unlocks once the three core clues are saved; all progress survives a refresh |
| Multiple pathways | Rooms can be visited in any order; interview answers depend on evidence found; three suspects can be accused, with different outcomes |
| Images / media | 16 images and 6 icons, used as the main visual element of each scene |
| Responsive layout | Tested at desktop (1280px) and phone (375px) widths |
| JavaScript-driven | Single state object, event delegation, localStorage persistence, history/hash navigation, modals |

## Quick walkthrough (contains spoilers)
Gallery: save the plaque, the trolley's transfer slip and the frame cloth. Security Room: save the badge log. Interview the
suspects and use the challenge prompts, then accuse **Mara Vale** in the Final Reveal. Accusing Iris or Leo gives the
"Wrong Turn" ending, and you can try again without losing evidence.

## Accessibility
Keyboard-operable controls, visible focus states, ARIA labels and live regions, alt text on every image, and reduced-motion support.

## Credits
See `CREDITS.md` for the source and licence notes for every image, icon and font. The code, story, characters and dialogue are original.
