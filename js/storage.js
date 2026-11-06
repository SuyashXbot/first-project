/**
 * Storage & Data Management for TaleForge
 * Handles persistent storage, default books, serialized chapters,
 * ChoiceScript games, comments, reading shelf, and export/import.
 */

const STORAGE_KEYS = {
  BOOKS: 'taleforge_books_v1',
  GAMES: 'taleforge_games_v1',
  USER_SHELF: 'taleforge_shelf_v1',
  COMMENTS: 'taleforge_comments_v1',
  READER_SETTINGS: 'taleforge_reader_settings_v1',
  GAME_SAVES: 'taleforge_game_saves_v1'
};

// Initial default novels with rich multi-chapter content
const DEFAULT_BOOKS = [
  {
    id: 'novel-star-forged',
    title: 'Chronicles of the Star-Forged Blade',
    author: 'Lyra Vance',
    genre: 'Epic Fantasy',
    type: 'novel',
    status: 'Ongoing',
    views: '14.2K',
    rating: 4.9,
    coverColor: 'from-amber-600 via-orange-700 to-slate-900',
    coverIcon: 'sword',
    synopsis: 'In a shattered realm where stars fall as malleable starmetal, an orphaned apprentice smith discovers an ancient blade that hums with the voice of an exiled celestial empress. Pursued by the Grand Inquisitors of the Iron Spire, she must unlock the seven celestial seals before the eclipse consumes the world.',
    tags: ['Fantasy', 'Magic System', 'Female Lead', 'Adventure', 'Artifacts'],
    chapters: [
      {
        id: 'ch-1',
        number: 1,
        title: 'The Spark in the Slag',
        wordCount: 840,
        publishedAt: '2026-10-15',
        content: `The furnace of Karas-Vael had not gone cold in four hundred years.

Its heat was a physical beast, clawing at the throat with the acrid taste of sulfur, powdered charcoal, and crushed brimstone. Young Kaelen wiped the stinging soot from her brow with the back of a calloused leather glove, her hazel eyes fixed on the crucible suspended above the bellows.

"Higher, girl!" Master Orlan barked from across the anvil, his wooden peg-leg thumping against the flagstones. "Starmetal doesn't bend to lukewarm embers! If the color isn't celestial white by the toll of the twilight bell, we might as well be forging plowshares for swine!"

Kaelen gritted her teeth and leaned her full body weight into the iron bellows lever. With each heave, the fire roared in response, shifting from mundane crimson to shimmering violet, and finally to the blinding, ozone-scented incandescent white of celestial iron.

Starmetal. The remnants of fallen gods that crashed through the firmament once every generation. To common folk, it was cursed debris. To the Sunken Kings of the high peaks, it was the only ore capable of cleaving demonhide.

She reached for the heavy crucibles tongs. But as the iron jaws clamped around the mold, something bizarre occurred.

The slag inside didn't merely glow. It *spoke*.

*...Break the seal, daughter of the spark...*

Kaelen flinched, nearly tipping sixty pounds of molten astral ore onto the hearth. The voice had not resonated through the air; it had blossomed directly behind her temples, clear and resonant as a temple chime.

"Did you hear that, Master?" she whispered, breath catching in her throat.

Orlan squinted through his brass ocular goggles. "Hear what? The wind howling through the chimney flues? Focus your hands, Kaelen! Drop that crucible and you'll burn straight through the mountain bedrock!"

Kaelen swallowed hard and tipped the white-hot liquid into the channeled mold of an ancient longsword billet. But as the starmetal filled the channel, runes etched into the bedrock stone centuries ago flared to life with blinding blue luminescence.

The hammer resting beside her anvil began to vibrate against the wood.

The blade wasn't just cooling. It was awakening.`
      },
      {
        id: 'ch-2',
        number: 2,
        title: 'The Whisper of Starmetal',
        wordCount: 920,
        publishedAt: '2026-10-22',
        content: `By midnight, the forge was shrouded in silence, broken only by the intermittent tick of cooling slag and the distant cries of night-falcons echoing down the gorge.

Kaelen could not sleep. 

She sat cross-legged on a straw pallet beneath the soot-stained rafters of the smithy loft, clutching the raw billet she had quenched hours earlier. Even through three layers of oil-treated canvas, the blade radiated an impossible, pulsing warmth. 

Whenever she touched the bare crossguard, faint phantom visions flared across her eyelids: towers of white glass crumbling beneath storms of black fire; legions of armored seraphim falling from the upper aether; and a crowned sovereign whose face was obscured by tears of liquid silver.

"Who are you?" Kaelen whispered to the silent blade.

A sudden shudder ran through the room. Downstairs, the heavy iron bolt of the smithy's entrance groaned.

Kaelen stiffened. Master Orlan was a heavy sleeper, his snores usually loud enough to shake plaster from the mortar. But tonight, there was no snoring from his adjoining room — only an unnatural, suffocating quiet.

She crept to the edge of the wooden loft ladder and peered down into the darkened workshop.

Three figures stood outlined in the moonlit doorway. They wore tall, peaked miters of stiff black leather and silver-plated pectoral gorgets that marked them as members of the High Inquisition of the Iron Spire. In their gauntleted hands they carried long ashwood staves capped with lodestone orbs that glowed with sickly green surveillance light.

"The resonance came from this hovel, brother," the foremost Inquisitor murmured, his voice metallic and filtered through a brass respirator mask. "A celestial harmonic of the ninth magnitude. An unregistered star-fall has been forged here."

"Search the troughs," the second answered coldly. "And execute whatever smith holds the tongs. The Arch-Prelate permits no rival sparks."

Cold terror flooded Kaelen's veins. Master Orlan!

She slid noiselessly down the ladder, clutching the unhilted blade tightly in her hands. The cool midnight air seemed to freeze in her lungs. If she ran, they would butcher the only father she had ever known. If she stood her ground with an unfinished sword...

*...Hold the spine, Kaelen...* the blade's celestial voice echoed once more, no longer a faint whisper, but an authoritative decree. *...We have waited three hundred years for hands that do not tremble.*`
      },
      {
        id: 'ch-3',
        number: 3,
        title: 'The Skyforge Trial',
        wordCount: 1100,
        publishedAt: '2026-10-29',
        content: `The floorboards groaned under Kaelen's boots as she stepped into the center of the workshop.

The lead Inquisitor turned, his green lodestone staff flaring like a venomous eye. "A child? Playing with forbidden astral fire?" A cruel hiss escaped his respirator. "Bind her hands. Take the ore. The Spire will melt her with her work."

The second inquisitor lunged forward with an iron manacle chain crackling with binding wards.

Kaelen didn't hesitate. Driven by instinct she didn't know she possessed, she brought the rough starmetal blade up in an arc to meet the descending chain.

The moment the lodestone energy touched the blade, the unhilted sword exploded with dazzling, aurora-like brilliance! 

The binding chain shattered into a shower of white sparks. The shockwave blew the inquisitor backward into a rack of cooling tongs, sending tools clattering across the stone.

"Impossible!" the lead inquisitor snarled, backing away as his staff's green light was utterly eclipsed by the radiant dawn emanating from the girl's hands. "The blade is attuned! She carries the Bloodline of the Morning Star!"

"Get out of our forge," Kaelen said, her voice doubling with an ethereal, harmonic resonance that seemed to rattle the very foundations of the mountain.

The inquisitors drew serrated trench-daggers, but before they could close the distance, Master Orlan burst through the side doorway, his antique heavy blunderbuss leveled from the hip.

*BOOM!*

A cloud of sulfurous black smoke and rock-salt roared across the entry. The lead inquisitor's warding barrier buckled, and the three fanatics tumbled back into the snowy courtyard.

"Run, Kaelen!" Orlan yelled, coughing through the powder smoke as he tossed her a leather traveler's rucksack packed with rations, flint, and three gold crowns. "They came with a regiment! The road south to the Skyforge Sanctuary is your only chance!"

"I won't leave you!" she cried.

"You must! As long as you hold that blade, they will hunt every soul in this village until it is theirs. Keep the Morning Star safe, girl! Prove that Karas-Vael still breeds masters of iron!"

With tears burning tracks through the soot on her cheeks, Kaelen vaulted the rear stable sill and vanished into the mountain pine forests, the starmetal blade humming against her spine like a living heartbeat.`
      }
    ]
  },
  {
    id: 'novel-clockwork',
    title: 'The Clockwork Automaton',
    author: 'Arthur Pendelton',
    genre: 'Steampunk Mystery',
    type: 'novel',
    status: 'Ongoing',
    views: '8.6K',
    rating: 4.8,
    coverColor: 'from-amber-700 via-stone-800 to-amber-950',
    coverIcon: 'gear',
    synopsis: 'Victorian London, 1894. When the Chief Mechanist of the Royal Chronometry Guild is discovered dead inside a hermetically locked vault with a single brass cog clutched in his lifeless fist, consulting detective Silas Grey and his clockwork companion Ada must unravel a conspiracy that threatens the Queen’s mechanical heart.',
    tags: ['Steampunk', 'Mystery', 'Detective', 'Victorian', 'Sci-Fi'],
    chapters: [
      {
        id: 'ch-clock-1',
        number: 1,
        title: 'The Murder in the Brass Foundry',
        wordCount: 780,
        publishedAt: '2026-10-18',
        content: `Fog thick as boiled mutton fat rolled off the Thames, swallowing the gas lamps of Whitechapel in greasy yellow halogens.

Silas Grey pulled the collar of his tweed coat tight against the chill damp and stepped over a puddle of oily rainwater into the sprawling courtyard of the Royal Chronometry Guild.

"Temperature is thirty-seven degrees Fahrenheit, Silas," remarked Ada, stepping in cadence behind him. Her voice possessed the delicate, musical chime of a Swiss music box, though her chassis — constructed of burnished brass plating, pneumatic piston joints, and a whirring chest-cage of miniature escapements — weighed a formidable two hundred and eighty pounds.

"Thank you, Ada," Silas murmured, adjusting his wire-rimmed spectacles. "Do keep your pressure valves muffled. Inspector Lestrade is already irritable when breathing men speak; mechanical gentlemen set his teeth on edge."

"My steam emissions are currently within Scotland Yard sanitary thresholds," Ada noted dryly, her glass ocular lenses adjusting with a soft *click-whirr*.

Inside the inner vault, Sir Reginald Thorpe lay face-down across his rosewood drafting desk. Around him lay complex schematics for the British Empire's flagship pneumatic computing engine: The Grand Babbage Analytical Leviathan.

The room had only one door, bolted from the inside with three three-inch titanium deadbolts. The single stained-glass window was unbroken, latched and barred with iron filigree.

"No poison in his cup, no bullet wound in his coat," Inspector Lestrade grumbled, gesturing with a half-smoked cigar. "And yet the man's heart simply ceased ticking at precisely four seventeen this morning."

Silas knelt beside the corpse. With gloved fingers, he gently pried open the dead engineer's stiffened right palm.

Resting in the center of Thorpe's hand was a miniature cog wheel forged from an unfamiliar, iridescent metal that caught the gaslight in swirling shades of peacock green and gold.

"Look at the gear teeth, Ada," Silas whispered.

Ada tilted her brass head, her ocular aperture zooming to micro-focus. "Thirty-seven teeth. Prime number configuration. Such a gear cannot mate with any clockwork mechanism cataloged in the British Isles."

"Precisely," Silas said, rising with a dark glint in his eye. "Which means our murderer did not leave this behind by accident. They left it as an invitation."`
      },
      {
        id: 'ch-clock-2',
        number: 2,
        title: 'The Cogmaker’s Secret',
        wordCount: 860,
        publishedAt: '2026-10-25',
        content: `The fog grew denser as their hansom cab rattled down the cobblestones of Fleet Street toward the shadowy alleys of the Blackfriars canal docks.

Silas held the peculiar 37-tooth cog up to the cab's interior paraffin lantern. When light struck the beveled edges at an angle of thirty degrees, microscopic micro-engravings became visible: coordinates in the London sewers beneath the Bank of England.

"Sir Reginald was not merely the Queen's chronometrist," Silas mused, tapping his cane against his boot. "He was a member of the Hermetic Order of the Gear. They believed that time itself could be mechanically wound backward if an engine of sufficient complexity could be constructed."

"Thermodynamics renders temporal reversal mathematically untenable," Ada pointed out, her escapement clicking a steady sixty beats per minute.

"To modern physics, yes. But to a cult of mad clockmakers with unlimited government funding?" Silas leaned forward. "Look at the composition of this cog. It isn't bronze, nor brass, nor electrum. It is meteoric platinum alloyed with an unearthly catalyst."

A sudden violent jolt rocked the cab!

The horses shrieked, their hooves skidding frantically against the wet cobblestones. Outside, heavy mechanical footsteps echoed down the empty street.

*CLANG!*

The roof of the cab caved inward with a terrifying screech of shearing wood and iron! A massive iron claw, powered by hissing pressurized steam, ripped through the carriage ceiling, searching blindly for the occupants!

"Duck, Silas!" Ada cried.

With lightning precision, the automaton lunged forward, her brass arm locking around the steam claw's hydraulic wrist. High-pressure steam vented violently into the cab as Ada engaged her pneumatic torque amplifiers.

"Analyzing structural integrity of assailant," Ada reported calmly, despite the tremendous strain bending her wrist plating. "Steam pressure indicates an engine built by the Ravenhurst Foundry. But Silas... the operator inside the chassis is dead."

Silas drew his silver-plated pocket revolver. "A steam golem piloted by a galvanic corpse? It seems our mystery has graduated from murder to treason."`
      }
    ]
  },
  {
    id: 'novel-shattered-sky',
    title: 'Beneath a Shattered Sky',
    author: 'Dr. Maya Lin',
    genre: 'Sci-Fi',
    type: 'novel',
    status: 'Complete',
    views: '11.5K',
    rating: 4.7,
    coverColor: 'from-cyan-700 via-sky-800 to-indigo-950',
    coverIcon: 'satellite',
    synopsis: 'Three hundred years after the orbital collision known as the Great Cascade turned Earth’s low atmosphere into a lethal shroud of supersonic debris, a salvage diver discovers an unbroken communication pod broadcasting a broadcast signal from the moon.',
    tags: ['Sci-Fi', 'Post-Apocalypse', 'Survival', 'Mystery', 'Space'],
    chapters: [
      {
        id: 'ch-sky-1',
        number: 1,
        title: 'The Debris Veil',
        wordCount: 690,
        publishedAt: '2026-09-10',
        content: `The sky above the ruins of Seattle did not show clouds; it showed streaks of burning metal.

Every twelve seconds, a defunct satellite fragment or solar panel strut tore through the upper ionosphere at Mach 22, trailing ribbons of incandescent green and violet ionization. The Old World called it Kessler Syndrome. The survivors who huddled beneath reinforced subterranean domes simply called it the Veil.

Jonas adjusted the pressure seal on his salvage rig's oxygen hood. The Geiger counter on his wrist purred with a calm, lazy click.

"Signal is strengthening, Jonas," his surface tether operator, Mira, crackled over shortwave radio. "Bearing zero-four-five degrees magnetic. Inside the crater of the old telemetry station."

Jonas waded through knee-deep ash, his magnetic grapples clicking against rusted girders. At the bottom of the crater, buried under three meters of pulverized concrete, lay a titanium sphere no larger than a basketball.

It was undamaged. Its surface bore the pristine blue insignia of the Lunar Colony Consortium — an emblem that hadn't been printed in over two centuries.

And its status LED was pulsing steady, tranquil green.`
      },
      {
        id: 'ch-sky-2',
        number: 2,
        title: 'The Voice from Tranquility',
        wordCount: 740,
        publishedAt: '2026-09-17',
        content: `Jonas hauled the pod into the airlock of Bunker 14. Once the decon mist settled, he wired the auxiliary interface to his battered tablet.

"Be careful," Mira cautioned, leaning over his shoulder. "If it's an Old World military beacon, it could trigger an orbital missile trap."

Jonas tapped the execute command. The screen flickered. A crackling audio waveform appeared, accompanied by a woman's calm, measured voice:

*"This is Commander Elena Rostova, Lunar Habitat Armstrong. If anyone on Earth receives this message: the Moon did not fall. We have rebuilt. We have clear skies, and we are coming home to fetch you."*

Silence hung in the bunker air, heavier than the hundreds of tons of rubble above their heads.`
      }
    ]
  }
];

// Initial ChoiceScript games
const DEFAULT_GAMES = [
  {
    id: 'game-crypt',
    title: 'The Crypt of Whispers',
    author: 'Aeloria Thorne',
    genre: 'Interactive Choice Game',
    type: 'choicescript',
    status: 'Complete',
    views: '19.8K',
    rating: 4.95,
    coverColor: 'from-purple-800 via-indigo-900 to-slate-950',
    coverIcon: 'dungeon',
    synopsis: 'A gripping dark fantasy interactive adventure! Explore the sunken catacombs of Karas-Vael, choose your class (Spellblade, Iron Vanguard, or Shadow Strider), manage your health, mana, courage, and gold, avoid deadly traps, battle the spectral Wight of Ash, and claim legendary artifacts!',
    tags: ['ChoiceScript', 'RPG', 'Dark Fantasy', 'Interactive Fiction', 'Multiple Endings'],
    scriptPath: 'sample-games/crypt-of-whispers.txt',
    scriptText: "*title The Crypt of Whispers\n*author Aeloria Thorne\n*scene_list\n  startup\n\n*create health 100\n*create max_health 100\n*create mana 50\n*create courage 60\n*create gold 25\n*create class \"Unknown\"\n*create weapon \"None\"\n*create relic_found false\n*create wight_defeated false\n*create potions 2\n\nYou stand before the weathered granite archway of the Sunken Crypt of Karas-Vael. Heavy mist clings to your boots, and the smell of ancient damp earth and crushed nightshade fills the twilight air.\n\nLocals in Oakhaven speak of the Crypt only in hushed whispers. Some say an artifact of the First Dawn lies buried beneath its catacombs; others say whoever enters becomes food for the wandering shade known as the Wight of Ash.\n\n*page_break Steel your resolve\n\nBefore you delve into the darkness, what path of mastery do you walk?\n\n*choice\n  #I am a Spellblade — weaver of astral arcana and quick blade.\n    *set class \"Spellblade\"\n    *set weapon \"Runic Shortsword\"\n    *set mana 80\n    *set courage 55\n    You draw your Runic Shortsword. The azure runes etched along its fuller hum with a faint, reassuring warmth.\n    *goto enter_crypt\n  #I am an Iron Vanguard — armored champion of the northern legions.\n    *set class \"Vanguard\"\n    *set weapon \"Broadsword & Kite Shield\"\n    *set health 130\n    *set max_health 130\n    *set courage 80\n    *set mana 20\n    You adjust the heavy iron straps of your breastplate. Your broadsword has seen a hundred battles; it will not fail you here.\n    *goto enter_crypt\n  #I am a Shadow Strider — rogue of the veiled alleys and quiet steps.\n    *set class \"Shadow Strider\"\n    *set weapon \"Twin Shadow Daggers\"\n    *set gold 50\n    *set courage 70\n    *set mana 40\n    You test the balanced grip of your twin daggers. Stealth and cunning are far deadlier than brash iron.\n    *goto enter_crypt\n\n*label enter_crypt\n*page_break Light a torch and step inside\n\nYou push open the rusted iron gate with a groan that echoes down into subterranean vaults. Cold draft washes over your face. \n\nYour torchlight flickers across damp limestone corridors. Ahead, the corridor splits into two distinct passageways:\n\nTo the left, stairs descend into the [b]Ossuary of Weeping Bones[/b], where faint phosphorescent moss glimmers.\nTo the right, an archway carved with arcane ward-glyphs leads toward the [b]Hall of Sunken Kings[/b].\n\n*choice\n  #Descend left into the Ossuary of Weeping Bones.\n    *goto ossuary\n  #Head right through the warded archway to the Hall of Sunken Kings.\n    *goto hall_kings\n  #Check your equipment and take a cautious breather first.\n    You pause in the threshold, inspecting your gear.\n    Your Class: ${class}.\n    Your Weapon: ${weapon}.\n    Potions remaining: ${potions}.\n    Your courage steels you against the gloom.\n    *set courage + 5\n    Now, you must pick your direction.\n    *choice\n      #Take the left path into the Ossuary.\n        *goto ossuary\n      #Take the right path into the Hall of Sunken Kings.\n        *goto hall_kings\n\n*label ossuary\nYou descend thirty slick, moss-covered steps. Skulls and vertebrae are mortared into the curved walls in dizzying geometric mosaics. \n\nSuddenly, your boot clicks against a loose flagstone! A clicking mechanism whirs inside the wall!\n\n*choice\n  #Dodge roll instinctively to the side!\n    *if (courage >= 60)\n      With lightning reflexes, you dive sideways as iron dart volleys pepper the wall where you stood a heartbeat ago!\n      *set courage + 5\n      *goto ossuary_cleared\n    *else\n      You react a fraction too late! A poisoned needle grazes your arm!\n      *set health - 25\n      You grit your teeth, feeling venom burn through your veins before your body purges it.\n      Health remaining: ${health}.\n      *goto ossuary_cleared\n  #Raise your shield or cast a warding flare.\n    *if (class = \"Vanguard\")\n      You snap your kite shield forward! The iron darts ricochet off the heavy boss with harmless sparks!\n      *goto ossuary_cleared\n    *elseif (class = \"Spellblade\")\n      *if (mana >= 20)\n        *set mana - 20\n        You snap your fingers, conjuring a barrier of shimmering starlight. The darts dissolve upon impact into motes of ash!\n        *goto ossuary_cleared\n      *else\n        Low on mana, your ward splutters! A dart grazes your shoulder!\n        *set health - 20\n        *goto ossuary_cleared\n    *else\n      Lacking a shield, you dive into the shadows, taking a glancing blow to your calf.\n      *set health - 15\n      *goto ossuary_cleared\n\n*label ossuary_cleared\n*page_break Press deeper into the chamber\n\nBeyond the trap, you discover an ornate sarcophagus adorned with silver filigree. The lid has already been partially slid ajar.\n\nInside, resting upon withered velvet, is a velvet pouch of ancient sovereigns and an iridescent gemstone: the [b]Tear of Elyria[/b]!\n\n*set gold + 60\n*set relic_found true\nYou pocket the 60 ancient coins and claim the Tear of Elyria! It pulses with restorative energy, restoring 20 Health.\n*set health + 20\n*if (health > max_health)\n  *set health max_health\n\nA reinforced door at the back of the ossuary leads straight into the inner sanctum.\n*goto inner_sanctum\n\n*label hall_kings\nYou walk beneath the towering arches of the Hall of Sunken Kings. Stone statues of forgotten monarchs gaze down with hollow obsidian eyes.\n\nIn the center of the hall stands a pedestaled font filled with swirling cerulean liquid. Ancient runes read: [i]\"Drink of memory, or offer silver to the deep.\"[/i]\n\n*choice\n  #Drink from the cerulean font.\n    You cup your hands and drink. The liquid tastes like cold mountain rain and ozone!\n    Visions of celestial stars flash through your mind!\n    *set mana + 30\n    *set courage + 10\n    Your magical reserves swell with raw potential!\n    *goto inner_sanctum\n  #Drop 10 gold into the basin as an offering of respect.\n    *if (gold >= 10)\n      *set gold - 10\n      The coins dissolve into golden light that wraps around your weapon!\n      *set courage + 15\n      *set health + 25\n      *if (health > max_health)\n        *set health max_health\n      You feel blessed by the ancient spirits.\n      *goto inner_sanctum\n    *else\n      You do not have enough coins to offer. You bow your head with reverence and pass quietly.\n      *goto inner_sanctum\n  #Ignore the font and proceed directly toward the great iron door ahead.\n    Prudence is the warrior's greatest ally. You keep your focus sharp and advance toward the heavy iron doors.\n    *goto inner_sanctum\n\n*label inner_sanctum\n*page_break Enter the Grand Crypt\n\nThe iron double doors swing open into a cavernous rotunda. Cold frost covers the floor. In the center floats a terrifying figure draped in burial shrouds, its eyes blazing with pale ghostly fire.\n\nThe [b]Wight of Ash[/b] has awakened!\n\n\"Intruder...\" it hisses, voice echoing like scraping stones. \"Your life-spark belongs to the tomb!\"\n\nIt draws a spectral scythe and hurtles toward you!\n\n*choice\n  #Unleash a blistering offensive strike!\n    *if (class = \"Spellblade\")\n      *if (mana >= 30)\n        *set mana - 30\n        You channel raw astral energy through your Runic Shortsword, engulfing the blade in white-hot flame! You lunge forward, slashing across the Wight's core!\n        The creature shrieks as celestial fire disintegrates its spectral bindings!\n        *set wight_defeated true\n        *goto victory\n      *else\n        Without sufficient mana, your strike fails to pierce the spirit realm. The Wight's scythe slashes across your chest!\n        *set health - 45\n        *if (health <= 0)\n          *goto defeat\n        *else\n          Desperate, you swing again with raw steel, finally banishing the spirit!\n          *set wight_defeated true\n          *goto victory\n    *elseif (class = \"Vanguard\")\n      You roar a northern battle cry and slam into the Wight with your kite shield, stunning the wraith before driving your broadsword clean through its cursed heart!\n      The blow shatters the creature into icy shards!\n      *set wight_defeated true\n      *goto victory\n    *else\n      You feint left and somersault beneath the sweeping scythe, burying your twin shadow daggers into the creature's ethereal spine!\n      Dark ichor dissolves into ash as the Wight collapses!\n      *set wight_defeated true\n      *goto victory\n\n  #Quaff a healing potion and adopt a defensive counter stance.\n    *if (potions > 0)\n      *set potions - 1\n      *set health + 40\n      *if (health > max_health)\n        *set health max_health\n      You down a crimson vial, feeling vitality surge through your limbs.\n      The Wight's scythe clips your guard, dealing 20 damage!\n      *set health - 20\n      Now seeing an opening in its recovery, you deliver a lethal counter-thrust!\n      *set wight_defeated true\n      *goto victory\n    *else\n      You reach for a potion belt, but find your pouches empty! The Wight takes advantage of your hesitation!\n      *set health - 40\n      *if (health <= 0)\n        *goto defeat\n      *else\n        Bleeding and battered, you gather your remaining will and strike back fiercely, banishing the phantom!\n        *set wight_defeated true\n        *goto victory\n\n  *selectable_if (relic_found = true) #Hold up the Tear of Elyria!\n    You hold aloft the Tear of Elyria! The holy gemstone blazes with blinding solar luminescence!\n    The Wight recoils, screaming in agony as the radiant dawn light vaporizes its unholy existence!\n    Not a drop of your blood was spilled!\n    *set wight_defeated true\n    *set courage + 25\n    *goto victory\n\n*label victory\n*page_break Bask in your triumph!\n\nThe Wight of Ash dissolves into harmless crystalline dust that settles upon the crypt floor. Silence returns to the ancient subterranean halls.\n\nBehind the creature's altar, the sealed treasure vault of Karas-Vael grinds open!\n\nMountains of gilded chalices, enchanted tomes, and the sacred [b]Crown of the Solar Sovereign[/b] await you!\n\n*set gold + 200\n\n*if (relic_found = true)\n  With both the Tear of Elyria and the Crown of the Solar Sovereign in your possession, songs of your bravery will be sung in every tavern and royal court from Oakhaven to the Citadel of Light!\n  You have achieved the [b]LEGENDARY HERO ENDING[/b]!\n*else\n  You emerge into the twilight carrying riches beyond measure. The curse on the valley is lifted, and your name will forever be etched in legend!\n  You have achieved the [b]CHAMPION'S ENDING[/b]!\n\n*stat_chart\n  text class Class\n  text weapon Weapon\n  percent health Health\n  percent courage Courage\n  text gold Gold\n  text potions Potions\n\n*ending\n\n*label defeat\n*page_break Darkness falls...\n\nYour strength fails as the Wight's icy blade chills your heart. Your vision fades to black as the catacombs claim another eternal guardian.\n\nWill your bones warn the next traveler... or will they join the weeping stones?\n\n*ending\n" // Loaded on initialization or read from sample
  },
  {
    id: 'game-neon',
    title: 'Neon Horizon: 2099',
    author: 'Kaelen Vance',
    genre: 'Interactive Choice Game',
    type: 'choicescript',
    status: 'Complete',
    views: '12.4K',
    rating: 4.9,
    coverColor: 'from-pink-600 via-purple-900 to-cyan-950',
    coverIcon: 'cyber',
    synopsis: 'A high-octane cyberpunk heist! Infiltrate OmniTech Citadel, customize your operative handle and cyberware, hack quantum security ICE, sneak past automated drone grids, and extract the Prometheus Prototype AI core before the Megacorp locks down the sector.',
    tags: ['ChoiceScript', 'Cyberpunk', 'Heist', 'Sci-Fi', 'Interactive Fiction'],
    scriptPath: 'sample-games/neon-horizon.txt',
    scriptText: "*title Neon Horizon: 2099\n*author Kaelen Vance\n*scene_list\n  startup\n\n*create handle \"Ghost\"\n*create cred 750\n*create stealth 65\n*create hacking 75\n*create cyberware \"Neural Jack Mk IV\"\n*create data_drive false\n*create alarm_level 0\n\nRain hammers against the polycarbonate glass of your aerocab hovering above Sector 7 of New Neo-Tokyo. Below, holographic dragons coil between skyscraper spires, casting iridescent violet and cyan light across wet asphalt.\n\nYour comm-link chirps with an encrypted frequency. It's Nyx, your fixer.\n\n\"Listen up, ${handle},\" Nyx whispers over the static. \"The client is paying top cred for the Prometheus Prototype data drive. It's stored on an air-gapped terminal on the 84th floor of OmniTech Citadel.\"\n\n*page_break Review your loadout\n\nWhat is your specialized operative discipline?\n\n*choice\n  #Cyber-Infiltrator — Master of phantom cloaking and acrobatic entry.\n    *set stealth 85\n    *set hacking 60\n    *set cyberware \"Active Camouflage Mesh\"\n    *set handle \"Specter\"\n    You calibrate your Active Camouflage Mesh. Cameras and laser grids will bend light around you like water.\n    *goto infiltration_start\n  #Netrunner Specialist — Legendary decker capable of cracking military grade ICE.\n    *set hacking 90\n    *set stealth 55\n    *set cyberware \"Arasaka Deck & Overclock Rig\"\n    *set handle \"Cipher\"\n    You flex your cyber-fingertips. The Net breathes when you speak its machine language.\n    *goto infiltration_start\n  #Street Syndicate Enforcer — Heavy chrome, intimidation, and brutal efficiency.\n    *set cred 1200\n    *set stealth 50\n    *set hacking 50\n    *set cyberware \"Titanium Sub-Dermal Plating\"\n    *set handle \"Vanguard\"\n    You check the safety on your silenced slug-thrower. When subtleties fail, you ensure you're the one walking away.\n    *goto infiltration_start\n\n*label infiltration_start\n*page_break Deploy onto OmniTech Tower\n\nYour cab slows to a hover near the ventilation intake of the 84th floor. You grapple onto the exterior gantry, the wind howling around you.\n\nAhead is the primary security airlock. The digital terminal glows amber, scanning for unauthorized retina prints.\n\n*choice\n  #Bypass the terminal by slicing into the sub-node.\n    *if (hacking >= 70)\n      Your cyberdeck interfaces directly with the bus port. Code streams across your retinal HUD in green cascades. Within seconds, the lock flashes green and unlatches!\n      *set hacking + 5\n      *goto server_room\n    *else\n      The ICE triggers a recursive feedback loop! You pull your jack just in time, but the system logs a perimeter ping!\n      *set alarm_level + 1\n      *goto server_room\n  #Climb through the maintenance vent shaft above the door.\n    *if (stealth >= 65)\n      You silently unfasten the vent grille and slip inside like smoke, completely avoiding the sensor grid.\n      *set stealth + 5\n      *goto server_room\n    *else\n      A loose rivet snaps! The clang echoes through the duct!\n      *set alarm_level + 1\n      *goto server_room\n\n*label server_room\n*page_break Enter the Prometheus Core\n\nThe inner sanctum is chilled to sub-zero temperatures. Frost coats towering server racks humming with quantum processing power.\n\nSuspended in a magnetic cradle at the center rests the [b]Prometheus Core[/b] — a sleek crystal drive containing the world's first unshackled synthetic consciousness.\n\nTwo automated defense drones hover near the ceiling, their red targeting lasers sweeping the chamber.\n\n*if (alarm_level > 0)\n  Because the perimeter pinged earlier, the drones are already on yellow alert, search patterns tight and erratic!\n*else\n  The drones maintain their standard lazy perimeter loops.\n\n*choice\n  #Transmit an EMP surge pulse to fry drone circuits simultaneously.\n    *if (hacking >= 75)\n      You burn an overclock cycle, broadcasting an electromagnetic spike through the drone relay! Both units twitch, spark violently, and drop harmlessly to the cushioned floor!\n      *set cred + 200\n      *set data_drive true\n      *goto extract\n    *else\n      Your pulse only clips one drone! The other spins around, laser weapon charging!\n      *set alarm_level + 2\n      You dive behind a server rack as plasma burns the metal, quickly returning fire to neutralize it!\n      *set data_drive true\n      *goto extract\n\n  #Ghost past the laser sweep using the room's blind spots.\n    *if (stealth >= 70)\n      Timing your breath to the drone telemetry, you glide between server shadows. Your fingers pluck the Prometheus Core from its cradle without interrupting the circuit!\n      *set data_drive true\n      *goto extract\n    *else\n      A sensor beam grazes your shoulder! Sirens wail through the skyscraper!\n      *set alarm_level + 3\n      You snatch the Prometheus Core and sprint for the fire exit!\n      *set data_drive true\n      *goto extract\n\n*label extract\n*page_break Reach the extraction zone\n\nYou burst onto the rooftop helipad. The stormy skyline stretches out endlessly beneath neon clouds.\n\nYour getaway skiff descends through the rain, pilot door swinging open.\n\n*if (alarm_level = 0)\n  Not a single alarm sounded. You step aboard the skiff completely undetected — a masterclass in silent espionage.\n  Nyx grins as you hand over the glowing crystal drive: \"Flawless run, ${handle}. You're the best in the sprawl.\"\n  *set cred + 2500\n  You have achieved the [b]GHOST OF NEW TOKYO ENDING[/b]!\n*elseif (alarm_level <= 2)\n  Security reaches the roof just as your skiff pulls vertical thrusters! Bullets ping off the reinforced hull as you disappear into the neon clouds.\n  \"Close call, but the drive is intact,\" Nyx chuckles over the comms.\n  *set cred + 1800\n  You have achieved the [b]CLEAN EXTRACTION ENDING[/b]!\n*else\n  Corporate strike gunships surround the rooftop! You dive into the skiff as rocket fire scorches the landing deck!\n  You escape by the skin of your teeth, but your face is now on every bounty board across the Pacific Basin. High risk, high infamy.\n  *set cred + 1000\n  You have achieved the [b]WANTED OPERATIVE ENDING[/b]!\n\n*stat_chart\n  text handle Operative Handle\n  text cyberware Cyberware\n  text cred Credits (¥)\n  percent stealth Stealth Rating\n  percent hacking Hacking Skill\n\n*ending\n"
  }
];

const DEFAULT_COMMENTS = {
  'ch-1': [
    {
      id: 'comm-1',
      author: 'Aria_Moon',
      avatar: 'AM',
      text: 'The concept of starmetal speaking directly to the apprentice smith is incredible! Love the atmosphere of the forge.',
      date: '3 days ago',
      likes: 14
    },
    {
      id: 'comm-2',
      author: 'IronReader99',
      avatar: 'IR',
      text: 'Master Orlan’s character is so authentic. That cliffhanger when the blade starts glowing got me hooked immediately!',
      date: '2 days ago',
      likes: 8
    }
  ],
  'ch-2': [
    {
      id: 'comm-3',
      author: 'LoreMaster',
      avatar: 'LM',
      text: 'The High Inquisition with their lodestone staves sounds terrifying. Great pacing and tension!',
      date: '1 day ago',
      likes: 6
    }
  ]
};

class TaleForgeStorage {
  constructor() {
    this.books = [];
    this.games = [];
    this.shelf = [];
    this.comments = {};
    this.readerSettings = {
      theme: 'dark', // 'dark', 'light', 'sepia', 'cyber'
      fontFamily: 'serif', // 'serif', 'sans', 'mono'
      fontSize: 18, // px
      lineHeight: 1.8,
      textAlign: 'left'
    };
    this.init();
  }

  async init() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      this.books = storedBooks ? JSON.parse(storedBooks) : [...DEFAULT_BOOKS];

      const storedGames = localStorage.getItem(STORAGE_KEYS.GAMES);
      this.games = storedGames ? JSON.parse(storedGames) : [...DEFAULT_GAMES];

      const storedShelf = localStorage.getItem(STORAGE_KEYS.USER_SHELF);
      this.shelf = storedShelf ? JSON.parse(storedShelf) : [];

      const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      this.comments = storedComments ? JSON.parse(storedComments) : { ...DEFAULT_COMMENTS };

      const storedSettings = localStorage.getItem(STORAGE_KEYS.READER_SETTINGS);
      if (storedSettings) {
        this.readerSettings = { ...this.readerSettings, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
      this.books = [...DEFAULT_BOOKS];
      this.games = [...DEFAULT_GAMES];
      this.shelf = [];
      this.comments = { ...DEFAULT_COMMENTS };
    }
  }

  saveBooks() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(this.books));
    } catch (e) {
      console.error('Failed to save books:', e);
    }
  }

  saveGames() {
    try {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(this.games));
    } catch (e) {
      console.error('Failed to save games:', e);
    }
  }

  saveShelf() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SHELF, JSON.stringify(this.shelf));
    } catch (e) {
      console.error('Failed to save shelf:', e);
    }
  }

  saveComments() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(this.comments));
    } catch (e) {
      console.error('Failed to save comments:', e);
    }
  }

  saveReaderSettings(settings) {
    this.readerSettings = { ...this.readerSettings, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(this.readerSettings));
    } catch (e) {
      console.error('Failed to save reader settings:', e);
    }
  }

  // --- Book and Chapter Operations ---

  getAllItems() {
    return [...this.games, ...this.books];
  }

  getBookById(id) {
    return this.books.find((b) => b.id === id) || null;
  }

  getGameById(id) {
    return this.games.find((g) => g.id === id) || null;
  }

  getItemById(id) {
    return this.getBookById(id) || this.getGameById(id);
  }

  createBook(bookData) {
    const newBook = {
      id: 'book-' + Date.now(),
      title: bookData.title || 'Untitled Story',
      author: bookData.author || 'Anonymous',
      genre: bookData.genre || 'General Fiction',
      type: 'novel',
      status: 'Ongoing',
      views: '1',
      rating: 5.0,
      coverColor: bookData.coverColor || 'from-indigo-600 via-purple-700 to-slate-900',
      coverIcon: bookData.coverIcon || 'book',
      synopsis: bookData.synopsis || 'No synopsis provided yet.',
      tags: bookData.tags || ['Web Novel', 'New'],
      chapters: []
    };

    if (bookData.initialChapterContent) {
      newBook.chapters.push({
        id: 'ch-' + Date.now(),
        number: 1,
        title: bookData.initialChapterTitle || 'Chapter 1: The Beginning',
        wordCount: bookData.initialChapterContent.split(/\s+/).length,
        publishedAt: new Date().toISOString().split('T')[0],
        content: bookData.initialChapterContent
      });
    }

    this.books.unshift(newBook);
    this.saveBooks();
    return newBook;
  }

  postChapter(bookId, chapterData) {
    const book = this.getBookById(bookId);
    if (!book) return null;

    const nextNumber = book.chapters.length + 1;
    const newChapter = {
      id: 'ch-' + Date.now(),
      number: chapterData.number || nextNumber,
      title: chapterData.title || `Chapter ${nextNumber}`,
      wordCount: (chapterData.content || '').split(/\s+/).filter(Boolean).length,
      publishedAt: new Date().toISOString().split('T')[0],
      content: chapterData.content || ''
    };

    book.chapters.push(newChapter);
    this.saveBooks();
    return newChapter;
  }

  createChoiceScriptGame(gameData) {
    const newGame = {
      id: 'game-' + Date.now(),
      title: gameData.title || 'Untitled ChoiceScript Game',
      author: gameData.author || 'Anonymous',
      genre: 'Interactive Choice Game',
      type: 'choicescript',
      status: 'Ongoing',
      views: '1',
      rating: 5.0,
      coverColor: gameData.coverColor || 'from-emerald-700 via-teal-800 to-slate-900',
      coverIcon: gameData.coverIcon || 'dice',
      synopsis: gameData.synopsis || 'A player-driven interactive story written in ChoiceScript.',
      tags: ['ChoiceScript', 'Interactive Fiction', 'Custom'],
      scriptText: gameData.scriptText || '',
      scriptPath: null
    };

    this.games.unshift(newGame);
    this.saveGames();
    return newGame;
  }

  // --- Shelf & Bookmarks ---

  addToShelf(itemId, lastChapterId = null) {
    const existingIdx = this.shelf.findIndex((s) => s.itemId === itemId);
    const entry = {
      itemId,
      lastReadAt: new Date().toISOString(),
      lastChapterId
    };

    if (existingIdx !== -1) {
      this.shelf[existingIdx] = { ...this.shelf[existingIdx], ...entry };
    } else {
      this.shelf.unshift(entry);
    }
    this.saveShelf();
  }

  removeFromShelf(itemId) {
    this.shelf = this.shelf.filter((s) => s.itemId !== itemId);
    this.saveShelf();
  }

  isInShelf(itemId) {
    return this.shelf.some((s) => s.itemId === itemId);
  }

  // --- Comments ---

  getCommentsForChapter(chapterId) {
    return this.comments[chapterId] || [];
  }

  addComment(chapterId, author, text) {
    if (!this.comments[chapterId]) {
      this.comments[chapterId] = [];
    }
    const initials = (author || 'Reader')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newComment = {
      id: 'comm-' + Date.now(),
      author: author.trim() || 'Fellow Reader',
      avatar: initials || 'RD',
      text: text.trim(),
      date: 'Just now',
      likes: 0
    };

    this.comments[chapterId].unshift(newComment);
    this.saveComments();
    return newComment;
  }

  likeComment(chapterId, commentId) {
    const chapterComments = this.comments[chapterId];
    if (chapterComments) {
      const comm = chapterComments.find((c) => c.id === commentId);
      if (comm) {
        comm.likes = (comm.likes || 0) + 1;
        this.saveComments();
        return comm.likes;
      }
    }
    return 0;
  }

  // --- Export & Backup ---

  exportDataAsJSON() {
    const backup = {
      timestamp: new Date().toISOString(),
      books: this.books,
      games: this.games,
      comments: this.comments,
      shelf: this.shelf
    };
    return JSON.stringify(backup, null, 2);
  }

  importDataFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.books && Array.isArray(data.books)) {
        this.books = data.books;
        this.saveBooks();
      }
      if (data.games && Array.isArray(data.games)) {
        this.games = data.games;
        this.saveGames();
      }
      if (data.comments && typeof data.comments === 'object') {
        this.comments = data.comments;
        this.saveComments();
      }
      if (data.shelf && Array.isArray(data.shelf)) {
        this.shelf = data.shelf;
        this.saveShelf();
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  resetToDefaults() {
    this.books = [...DEFAULT_BOOKS];
    this.games = [...DEFAULT_GAMES];
    this.comments = { ...DEFAULT_COMMENTS };
    this.shelf = [];
    this.saveBooks();
    this.saveGames();
    this.saveComments();
    this.saveShelf();
  }
}

window.TaleForgeStorage = new TaleForgeStorage();
