// Word Detective (id: wordguess): crack a secret five-letter word in six guesses.
// An original guess-the-word game for Page Quest: a detective's case file on a desk, notebook index cards for tiles.
// DOM only, no canvas, no images, no libraries. Free to play any time.
(function(){
  'use strict';
  window.BreakGames = window.BreakGames || {};
  const HF = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif', TF = '"Lexend", Verdana, system-ui, sans-serif';
  const LEN = 5, TRIES = 6;
  const G3 = [
"plant|a living thing that grows in soil|We put the plant by the sunny window.",
"beach|sandy land next to the sea|We built a sandcastle at the beach.",
"horse|a large animal that people can ride|The horse ran fast across the field.",
"smile|a happy look you make with your mouth|Her big smile made everyone feel welcome.",
"cloud|a white or gray puff floating in the sky|That cloud looks like a bunny.",
"bread|food baked from flour, used for sandwiches|Dad sliced the warm bread for lunch.",
"train|a line of cars that rolls along tracks|The train whistled as it left the station.",
"happy|feeling glad and cheerful|The puppy was happy to see me.",
"apple|a round, crunchy red or green fruit|I packed an apple in my lunch box.",
"chair|a seat with a back for one person|Please push in your chair.",
"table|furniture with a flat top and legs|We set the plates on the table.",
"house|a building where people live|My house has a red door.",
"mouse|a small animal with a long tail|The mouse nibbled a piece of cheese.",
"water|the clear liquid we drink|Drink some water after you play.",
"light|what lets us see; the opposite of dark|Turn on the light so we can read.",
"night|the dark time when the sun is down|We saw the moon last night.",
"sleep|to rest with your eyes closed|The baby will sleep after lunch.",
"dream|pictures and stories in your mind while you sleep|I had a dream about flying.",
"green|the color of grass and leaves|The frog is bright green.",
"brown|the color of chocolate and tree bark|My dog has soft brown fur.",
"white|the color of snow|The snow made the yard white.",
"juice|a drink squeezed from fruit|I had orange juice for breakfast.",
"lemon|a sour yellow fruit|The lemon made my lips pucker.",
"melon|a big, sweet, juicy fruit|We shared a cold melon at the picnic.",
"grape|a small round fruit that grows in bunches|She ate one grape at a time.",
"peach|a soft, fuzzy, sweet fruit|The peach was juicy and sweet.",
"candy|a sweet treat made with sugar|We got one piece of candy each.",
"pizza|flat bread baked with sauce and cheese on top|We had pizza on Friday night.",
"snack|a small bit of food between meals|Carrots make a crunchy snack.",
"lunch|the meal you eat in the middle of the day|We eat lunch at noon.",
"spoon|a tool for eating soup or cereal|I need a spoon for my soup.",
"plate|a flat dish you eat food from|Put your plate in the sink, please.",
"truck|a big vehicle that carries heavy loads|The truck carried a load of logs.",
"wheel|a round part that turns so things can roll|My bike has a squeaky wheel.",
"river|a long stream of flowing water|The boat floated down the river.",
"ocean|a huge body of salt water|Whales swim in the ocean.",
"storm|bad weather with strong wind, rain or snow|The storm knocked down a branch.",
"sunny|bright with lots of sunshine|It was a sunny day at the park.",
"rainy|wet, with rain falling|We played board games on a rainy day.",
"windy|with lots of wind blowing|It was too windy to fly the kite.",
"snowy|covered with snow|The snowy hill was perfect for sledding.",
"tiger|a big wild cat with orange and black stripes|The tiger rested in the shade.",
"zebra|a horse-like animal with black and white stripes|The zebra drank from the pond.",
"camel|a desert animal with a hump on its back|The camel walked across the sand.",
"sheep|a farm animal with a thick wool coat|The sheep followed each other up the hill.",
"goose|a large bird with a long neck that honks|A goose honked at us by the lake.",
"eagle|a large bird with sharp eyes|The eagle soared high above the trees.",
"whale|a huge animal that lives in the ocean|We saw a whale splash its tail.",
"shark|a big fish with sharp teeth|The shark swam past the glass.",
"snake|a long animal with no legs that slithers|The snake hid under a rock.",
"puppy|a baby dog|The puppy chased its own tail.",
"bunny|a rabbit, often a young one|The bunny hopped into the garden.",
"chick|a baby bird, often a baby chicken|The fluffy chick peeped for its mom.",
"skunk|a black and white animal that sprays a stinky smell|The skunk waddled across the yard.",
"otter|a furry animal that swims and floats on its back|The otter cracked a shell on its belly.",
"panda|a black and white bear that eats bamboo|The panda munched on bamboo all day.",
"koala|a furry tree-climbing animal from Australia|The koala hugged the tree branch.",
"robin|a bird with a red-orange chest|A robin built a nest in our tree.",
"shirt|clothing you wear on the top of your body|He wore a blue shirt to school.",
"dress|clothing like a long top with a skirt|She wore a yellow dress to the party.",
"skirt|clothing that hangs down from the waist|Her skirt twirled when she spun.",
"glove|something you wear on your hand to keep warm|I lost one glove in the snow.",
"scarf|a long cloth you wrap around your neck|Grandma knitted me a warm scarf.",
"watch|a small clock you wear on your wrist|My watch says it is time to go.",
"clock|a tool that shows the time|The clock in class ticks loudly.",
"phone|a device for calling and talking to people|Mom answered the phone.",
"radio|a device that plays music and news|We sang along to the radio.",
"music|sounds put together in a pleasing way|We dance when the music plays.",
"piano|a large instrument with black and white keys|She practices the piano every day.",
"flute|an instrument you play by blowing across a hole|He played a song on the flute.",
"dance|to move your body to music|Let's dance in the kitchen.",
"laugh|to make sounds because something is funny|The joke made us all laugh.",
"cheer|to shout to show you are happy or proud|We cheer when our team scores.",
"hello|a word you say to greet someone|Say hello to our new classmate.",
"thank|to tell someone you are glad for what they did|Remember to thank the bus driver.",
"sorry|feeling sad about something you did|I am sorry I bumped you.",
"funny|making you laugh|The clown had a funny red nose.",
"silly|goofy and not serious|We made silly faces in the mirror.",
"brave|not afraid to do something hard|The brave girl jumped into the pool.",
"quiet|making little or no sound|Please be quiet in the library.",
"noisy|making a lot of sound|The noisy birds woke me up.",
"tired|needing rest or sleep|I was tired after the long hike.",
"angry|feeling very mad|The cat looked angry when it got wet.",
"proud|pleased about something done well|I felt proud of my drawing.",
"sweet|tasting like sugar|The strawberries were very sweet.",
"salty|tasting like salt|The popcorn was warm and salty.",
"fresh|new, and not old or spoiled|We bought fresh eggs at the farm.",
"clean|not dirty|My room is clean and tidy.",
"dirty|covered with mud or dust|My boots got dirty in the mud.",
"round|shaped like a circle or a ball|The ball is round and bouncy.",
"large|big in size|An elephant is a large animal.",
"small|little in size|The small kitten fit in my hands.",
"short|not long or not tall|My little brother is short.",
"early|before the usual time|We woke up early to see the sunrise.",
"later|after now|I will finish my book later.",
"first|before all the others|She was first in line.",
"third|number three in order|I came in third in the race.",
"seven|the number after six|A week has seven days.",
"eight|the number after seven|A spider has eight legs.",
"three|the number after two|I have three pet fish.",
"dozen|a group of twelve|We baked a dozen cookies.",
"money|coins and bills used to buy things|I saved my money in a jar.",
"store|a shop where you buy things|We went to the store for milk.",
"paper|thin sheets you write or draw on|Fold the paper in half.",
"paint|colored liquid you brush onto things|We used blue paint for the sky.",
"color|red, blue and yellow are kinds of this|What is your favorite color?",
"brush|a tool with bristles for hair, teeth or paint|Brush your teeth before bed.",
"block|a solid piece of wood or plastic to build with|He stacked one block on top of another.",
"build|to make something by putting parts together|Let's build a fort with pillows.",
"climb|to go up using your hands and feet|We like to climb the jungle gym.",
"throw|to send something through the air with your arm|Throw the ball to me!",
"catch|to grab something that is moving|Can you catch the frisbee?",
"swing|a seat that moves back and forth on ropes or chains|I went high on the swing.",
"slide|to move smoothly along a surface|We slide down the hill on a sled.",
"skate|to glide on skates|We skate on the frozen pond.",
"float|to stay on top of water|The leaf will float on the pond.",
"sport|a game like soccer or basketball|Soccer is my favorite sport.",
"field|an open area of land, often grassy|The cows ate grass in the field.",
"grass|green plants that cover lawns and fields|The grass is wet in the morning.",
"trunk|the thick main stem of a tree|The squirrel ran up the tree trunk.",
"stick|a thin piece of wood|The dog fetched the stick.",
"stone|a small piece of rock|I skipped a stone across the lake.",
"shell|a hard outer cover, like a snail's|I found a pretty shell on the beach.",
"earth|the planet we live on|Earth is the third planet from the sun.",
"world|all the people and places on Earth|I want to travel around the world.",
"space|the area beyond Earth where the stars are|Astronauts float in space.",
"heart|the body part that pumps blood|Your heart beats faster when you run.",
"mouth|the part of your face you eat and talk with|Cover your mouth when you cough.",
"tooth|one of the hard white parts in your mouth|My loose tooth finally came out.",
"thumb|the short, thick finger on your hand|Give me a thumbs up!",
"elbow|the bend in the middle of your arm|I bumped my elbow on the door.",
"queen|a woman who rules a country|The queen waved from the castle.",
"crown|a fancy ring worn on a king's or queen's head|The crown sparkled with jewels.",
"giant|a very big, strong person in stories|The giant lived at the top of the beanstalk.",
"magic|tricks or powers that seem impossible|The magic trick made the coin disappear.",
"fairy|a tiny magical creature with wings in stories|The fairy sprinkled sparkly dust.",
"ghost|a spooky spirit in stories|He dressed as a ghost for the party.",
"story|a tale about people or events|Dad read me a bedtime story.",
"write|to put words on paper|I will write a letter to Grandpa.",
"spell|to say or write the letters of a word in order|Can you spell your name?",
"learn|to find out something new|We learn about bugs in science.",
"teach|to help someone learn|I will teach my sister to tie her shoes.",
"class|a group of students learning together|Our class went on a field trip.",
"smart|quick to learn and understand|The smart dog learned a new trick.",
"think|to use your mind|Let me think about the answer.",
"share|to let others use or have some of yours|Please share the crayons.",
"party|a fun time when people get together|We played games at the party.",
"toast|bread that is browned by heat|I like jam on my toast.",
"honey|a sweet, sticky food made by bees|The bear licked the honey.",
"sugar|something sweet you add to food|We added sugar to the lemonade.",
"flour|a powder made from grain, used for baking|Mix the flour and eggs together.",
"cream|the thick, rich part of milk|She put whipped cream on the pie.",
"pasta|food made from dough, like noodles|We had pasta with red sauce.",
"salad|a mix of vegetables, often served cold|The salad had lettuce and tomatoes.",
"onion|a vegetable with layers that can make you cry|Chopping the onion made my eyes water.",
"fruit|the sweet part of a plant that holds seeds|An orange is my favorite fruit.",
"bloom|to open up into a flower|The roses bloom in the spring.",
"daisy|a flower with white petals and a yellow middle|I picked a daisy for my mom.",
"tulip|a cup-shaped flower that blooms in spring|A red tulip grew by the fence.",
"fence|a wall of wood or wire around a yard|The cat sat on the fence.",
"porch|a covered area outside the front door|We sat on the porch and watched the rain.",
"couch|a long, soft seat for more than one person|We cuddled on the couch to watch a movie.",
"floor|the part of a room you walk on|Please pick up the toys on the floor.",
"shelf|a flat board on a wall that holds things|The books are on the top shelf.",
"towel|a cloth for drying yourself|Wrap up in a towel after your bath.",
"quilt|a warm blanket made of stitched pieces of cloth|Grandma made this quilt by hand.",
"nurse|a person who cares for sick people|The nurse checked my temperature.",
"baker|a person who bakes bread and cakes|The baker made a giant cake.",
"pilot|a person who flies an airplane|The pilot waved from the cockpit.",
"coach|a person who trains a team|Our coach taught us to dribble.",
"clown|a funny performer at a circus|The clown juggled five balls.",
"trail|a path through woods or hills|We hiked the trail to the waterfall.",
"creek|a small stream|We splashed in the creek.",
"swamp|wet, soggy land with lots of plants|Frogs croaked in the swamp.",
"north|the direction toward the top of a map|Birds fly north in the spring.",
"south|the direction toward the bottom of a map|We drove south to visit Grandma.",
"month|one of the twelve parts of a year|My birthday is next month.",
"today|this day|Today is a great day to read.",
"visit|to go and see a person or place|We visit the library every week.",
"smell|to notice something with your nose|I can smell cookies baking.",
"taste|to notice the flavor of food with your tongue|Taste this soup and tell me if it's good.",
"touch|to feel something with your hand|Touch the soft bunny gently.",
"sound|something you hear|I heard a funny sound outside.",
"voice|the sound you make when you speak or sing|She has a lovely singing voice.",
"shout|to yell in a loud voice|Don't shout in the hallway.",
"plane|an airplane, a machine that flies|The plane flew above the clouds.",
"wagon|a cart with four wheels that you pull|We pulled the pumpkins in a wagon.",
"robot|a machine that can do jobs by itself|The robot cleaned the floor.",
"teddy|a soft stuffed toy bear|I hug my teddy at night.",
"lucky|having good things happen by chance|I found a lucky penny.",
"great|very good|We had a great time at the zoo.",
"stamp|a small sticker you put on a letter to mail it|Put a stamp on the envelope.",
"snail|a slow animal that carries a shell on its back|The snail left a shiny trail.",
"llama|a woolly animal from South America|The llama had long, fluffy fur.",
"squid|a sea animal with ten arms|The squid squirted ink and swam away.",
"chalk|a soft stick for writing on a board or sidewalk|We drew a hopscotch game with chalk.",
"erase|to rub out or remove marks|Erase the board when you are done.",
"board|a flat piece of wood, or a game board|Set up the board for our game.",
"ruler|a straight strip for measuring length|Use a ruler to draw a straight line.",
"sweep|to clean a floor with a broom|I help sweep the kitchen floor.",
"broom|a brush with a long handle for sweeping|The broom is in the closet.",
"jelly|a sweet spread made from fruit|I like peanut butter and jelly.",
"cocoa|a hot chocolate drink|We drank cocoa after sledding.",
"maple|a tree whose sap makes sweet syrup|The maple leaves turned red.",
"beard|hair that grows on a man's chin and cheeks|Grandpa has a long white beard.",
"pouch|a small bag, or a pocket on an animal|The baby kangaroo rode in a pouch.",
"kitty|a cat, often a young one|The kitty curled up on my lap.",
"grade|a year or level in school|I am in third grade."];
  const G5 = [
"craft|skill in making things, often by hand|We made a paper lantern in craft class.",
"globe|a round model of the Earth|She spun the globe to find Japan.",
"solar|having to do with the sun|Solar panels turn sunlight into power.",
"orbit|the curved path one object travels around another|The moon is in orbit around Earth.",
"rapid|very fast|The river's rapid current carried the raft.",
"swift|moving very quickly|The swift fox darted into the woods.",
"fable|a short story that teaches a lesson|In the fable, the slow tortoise wins the race.",
"vivid|very bright, clear or strong|The sunset filled the sky with vivid colors.",
"merit|a quality that earns praise|Her science project had real merit.",
"nerve|a thread in your body that carries signals|A nerve sends messages from your toe to your brain.",
"adapt|to change to fit a new situation|Animals adapt to cold winters.",
"alert|watchful and ready to act|The guard dog stayed alert all night.",
"ample|more than enough|We had ample time to finish the test.",
"angle|the space between two lines that meet|A square has four right angles.",
"argue|to give reasons for or against something|They argue about which team is best.",
"avoid|to keep away from|Avoid the puddles on your way to school.",
"aware|knowing about something|Be aware of cars when you cross.",
"basin|a bowl-shaped dip in the land, or a sink|Rain filled the rocky basin.",
"blend|to mix together smoothly|Blend the paint to make purple.",
"boast|to brag about yourself|He likes to boast about his high score.",
"brisk|quick and lively, or chilly|We took a brisk walk in the cold air.",
"cabin|a small, simple house, often made of wood|We stayed in a cabin by the lake.",
"canal|a waterway dug by people|Boats moved slowly along the canal.",
"cargo|goods carried by a ship, plane or truck|The ship's cargo was boxes of bananas.",
"chart|a picture that shows information|We made a chart of our reading minutes.",
"civic|having to do with a city or its citizens|Voting is an important civic duty.",
"claim|to say something is true or yours|He claimed the last seat on the bus.",
"coast|land along the edge of the sea|We drove along the rocky coast.",
"comet|an icy space object with a glowing tail|The comet streaked across the night sky.",
"coral|a hard sea material made by tiny animals|Bright fish swam around the coral.",
"crest|the top of a hill or wave|The surfer rode the crest of the wave.",
"crisp|firm, dry and easy to snap|The fall leaves were crisp underfoot.",
"curve|a line that bends smoothly|The road made a sharp curve.",
"debut|a first public appearance|The band made its debut at the fair.",
"decay|to rot or break down slowly|Fallen leaves decay into soil.",
"delay|to make something happen later|The snow caused a long delay.",
"delta|land formed where a river meets the sea|Birds nest in the river delta.",
"dense|packed closely together|The dense fog hid the bridge.",
"depth|how deep something is|We measured the depth of the pool.",
"digit|a single number from 0 to 9|The code has four digits.",
"draft|an early version of a piece of writing|I revised my first draft.",
"drift|to be carried slowly by wind or water|The raft began to drift downstream.",
"eager|wanting very much to do something|The students were eager to start.",
"elect|to choose someone by voting|We will elect a class president.",
"equal|the same in amount or value|Cut the pie into equal pieces.",
"erode|to wear away slowly|Waves erode the cliffs over time.",
"essay|a short piece of writing about one topic|She wrote an essay about whales.",
"event|something that happens, often something important|The science fair is a big event.",
"exact|completely correct, with no mistakes|We need the exact amount of flour.",
"fault|a mistake, or a crack in Earth's crust|It was my fault the milk spilled.",
"feast|a large, special meal|We had a feast on Thanksgiving.",
"fiber|a thin thread of material|Cotton fiber is spun into yarn.",
"flock|a group of birds or sheep|A flock of geese flew south.",
"focus|to pay close attention|Focus on one problem at a time.",
"forge|to shape metal by heating and hammering|The blacksmith will forge a horseshoe.",
"frail|weak and easily broken|The old map was frail and torn.",
"frost|thin ice crystals that form on cold surfaces|Frost covered the car window.",
"gauge|a tool that measures something|The gauge showed the tank was full.",
"genre|a kind of writing or art, like mystery|Fantasy is my favorite genre.",
"glide|to move smoothly and easily|The hawk seemed to glide on the wind.",
"gleam|to shine softly|The polished trophy began to gleam.",
"grain|a seed of wheat, rice or oats|Rice is a grain eaten around the world.",
"grasp|to hold firmly, or to understand|I finally grasp how fractions work.",
"grief|deep sadness|She felt grief when her best friend moved away.",
"guard|to watch over and protect|Geese guard their nests fiercely.",
"guide|a person who shows the way|Our guide led us through the cave.",
"habit|something you do often, without thinking|Reading every night is a good habit.",
"haste|great hurry|In his haste, he forgot his lunch.",
"haven|a safe place|The library is a quiet haven.",
"honor|great respect|It was an honor to carry the flag.",
"humid|damp and sticky in the air|The summer air was hot and humid.",
"ideal|perfect, the best possible|It was an ideal day for a picnic.",
"image|a picture or likeness|The image on the screen was blurry.",
"index|an alphabetical list at the back of a book|Look up \"volcano\" in the index.",
"judge|a person who decides a case or contest|The judge gave our team first place.",
"label|a tag that names or describes something|Read the label on the jar.",
"lever|a bar used to lift or move heavy things|We used a lever to lift the rock.",
"limit|the greatest amount allowed|The speed limit here is twenty.",
"logic|careful, clear reasoning|Use logic to solve the puzzle.",
"loyal|faithful to friends or a cause|My dog is loyal and follows me everywhere.",
"lunar|having to do with the moon|We watched a lunar eclipse.",
"major|very important or large|The storm caused major flooding.",
"marsh|soft, wet land with tall grasses|Herons hunt for fish in the marsh.",
"metal|a hard material like iron, copper or gold|The bridge is made of metal.",
"meter|a unit of length, a little more than a yard|The pool is twenty-five meters long.",
"minor|small or less important|It was only a minor scratch.",
"model|a small copy of something|He built a model of a rocket.",
"moist|slightly wet|The cake was soft and moist.",
"motor|a machine that makes something move|The boat's motor hummed loudly.",
"noble|having fine character, or of high rank|It was a noble thing to help her.",
"novel|a long book that tells a story|I finished a mystery novel last week.",
"oasis|a green spot with water in a desert|The travelers rested at the oasis.",
"organ|a body part that does a job, like the heart|The skin is the body's largest organ.",
"panel|a flat piece, or a group of experts|A panel of judges tasted the pies.",
"pause|a short stop|Pause the video so I can see.",
"peril|great danger|The ship was in peril during the storm.",
"phase|a stage in a process|The moon's phase tonight is full.",
"pitch|how high or low a sound is|The singer hit a very high pitch.",
"plain|simple, or a wide area of flat land|Bison roamed the open plain.",
"plead|to beg for something|The puppy seemed to plead for a treat.",
"plume|a large feather, or a cloud of smoke|A plume of smoke rose from the chimney.",
"polar|having to do with the North or South Pole|Polar bears live in the Arctic.",
"pound|a unit of weight, or to hit hard|The bag of apples weighs one pound.",
"prism|a clear shape that splits light into colors|The prism made a rainbow on the wall.",
"probe|to explore or examine closely|Scientists sent a probe to Mars.",
"proof|facts that show something is true|The muddy paw prints were proof.",
"quest|a long search for something|The knight went on a quest.",
"ratio|a comparison of two amounts|The ratio of cats to dogs is two to one.",
"realm|a kingdom or area|The dragon ruled a magical realm.",
"rebel|a person who goes against those in charge|The rebel refused to follow the rules.",
"recap|a short summary of what happened|Give me a quick recap of the game.",
"relay|a race where teammates take turns|Our team won the relay race.",
"reply|to answer|Please reply to my letter soon.",
"rhyme|words that end with the same sound|\"Cat\" and \"hat\" rhyme.",
"rival|someone you compete against|The two teams are old rivals.",
"scale|a tool for weighing, or a plate on a fish|The fish's scales shimmered in the sun.",
"scene|a place where something happens, or part of a play|The first scene takes place in a forest.",
"scent|a smell|The scent of pine filled the cabin.",
"scout|to explore to get information|We sent a friend to scout the trail.",
"serve|to help others, or to give out food|Volunteers serve meals at the shelter.",
"shade|an area out of the sun|We rested in the shade of an oak.",
"shore|land along the edge of water|Waves crashed on the shore.",
"sight|the ability to see|Eagles have amazing sight.",
"skill|the ability to do something well|Juggling takes a lot of skill.",
"slope|a surface that slants up or down|We skied down the gentle slope.",
"solid|firm, not a liquid or a gas|Ice is water in solid form.",
"solve|to find the answer|Can you solve this riddle?",
"spare|extra, kept in case it is needed|We keep a spare tire in the trunk.",
"spark|a tiny flash of fire or light|A spark flew from the campfire.",
"spine|the backbone, or the back of a book|Read the title on the book's spine.",
"stage|a raised platform for shows, or a step|The actors bowed on the stage.",
"steep|rising or falling sharply|The steep hill made my legs burn.",
"stern|strict and serious|The coach gave a stern warning.",
"stray|to wander away|Don't let the sheep stray too far.",
"style|a way of doing or looking|I like the style of your drawings.",
"surge|a sudden rush forward|A surge of water rushed over the dam.",
"theme|the main idea or message|The theme of the story is kindness.",
"thorn|a sharp point on a plant's stem|A thorn pricked my finger.",
"tidal|having to do with tides|We explored the tidal pools.",
"token|a small sign or symbol|He gave her a card as a token of thanks.",
"topic|the subject of talk or writing|Pick a topic for your report.",
"trace|to copy by following lines, or a tiny sign|Trace the map onto thin paper.",
"trait|a quality, like kindness or height|Curiosity is a helpful trait.",
"trend|a general direction of change|The trend this year is bright colors.",
"trial|a test, or a case heard in court|We gave the new recipe a trial.",
"tribe|a group of families who share ways of life|The tribe gathered for a celebration.",
"truth|what is true or real|Always tell the truth.",
"unite|to join together|The teams unite to clean the park.",
"urban|having to do with a city|Pigeons do well in urban areas.",
"valid|true, sound or acceptable|She made a valid point.",
"value|how much something is worth|This old coin has great value.",
"vapor|a gas made from a liquid, like steam|Water vapor rose from the hot spring.",
"verse|a group of lines in a poem or song|We sang the first verse together.",
"vital|very important or necessary|Water is vital for all living things.",
"vocal|using the voice, or speaking out|She was vocal about saving the park.",
"weary|very tired|The weary hikers sat down to rest.",
"wheat|a grain used to make flour|Fields of wheat waved in the wind.",
"whirl|to spin around quickly|The leaves whirl in the wind.",
"wield|to hold and use a tool|The chef can wield a whisk like a pro.",
"woven|made by weaving threads together|The basket was woven from reeds.",
"yield|to give way, or to produce|This tree will yield many apples.",
"zesty|full of lively flavor|The salsa was zesty and fresh.",
"agile|able to move quickly and easily|The agile cat leapt onto the shelf.",
"atlas|a book of maps|Find Brazil in the atlas.",
"cedar|a kind of evergreen tree with fragrant wood|The chest was made of cedar.",
"chord|musical notes played at the same time|She strummed a chord on her guitar.",
"dwell|to live in a place|Owls dwell in hollow trees.",
"ember|a glowing piece of wood in a dying fire|One ember still glowed in the fireplace.",
"flair|a natural talent or style|He has a flair for drawing.",
"fleet|a group of ships or vehicles|A fleet of sailboats left the harbor.",
"flint|a hard stone that makes sparks|Early people used flint to start fires.",
"gusty|windy in sudden bursts|The gusty wind flipped my umbrella.",
"hatch|to break out of an egg|The ducklings will hatch soon.",
"inlet|a narrow strip of water reaching into land|We kayaked into a quiet inlet.",
"jolly|cheerful and full of fun|The jolly baker hummed as he worked.",
"knack|a natural skill|She has a knack for solving puzzles.",
"lofty|very high|The castle had lofty towers.",
"lyric|the words of a song|I can't remember the next lyric.",
"mimic|to copy how someone acts or sounds|Parrots can mimic human voices.",
"mirth|laughter and fun|The room was full of mirth.",
"motto|a short saying that guides you|Our class motto is \"Never give up.\"",
"opera|a play in which the story is sung|We heard a famous song from an opera.",
"poise|calm, steady confidence|She spoke with poise at the assembly.",
"query|a question|I have a query about the homework.",
"radar|a system that finds objects using radio waves|Radar tracked the storm's path.",
"ranch|a large farm for raising animals|Cattle graze on the ranch.",
"relic|an object surviving from long ago|The museum displayed an ancient relic.",
"ridge|a long, narrow hilltop|We hiked along the rocky ridge.",
"rigid|stiff, not bending|The cardboard was too rigid to fold.",
"rural|having to do with the countryside|My cousins live in a rural town.",
"savor|to enjoy slowly|Savor every bite of your dessert.",
"sleet|icy rain|Sleet made the sidewalks slippery.",
"spice|something that adds flavor to food|Cinnamon is a warm spice.",
"squad|a small team|The cleanup squad picked up litter.",
"steer|to guide a vehicle or boat|Steer the boat away from the rocks.",
"tempo|the speed of music|The song has a quick tempo.",
"tread|to walk on or over|Tread carefully on the icy path.",
"usher|to lead someone to a seat|The usher showed us to our seats.",
"vault|a safe room, or to leap over something|The gymnast will vault over the bar.",
"vigor|strength and energy|The team played with great vigor.",
"vista|a wide, beautiful view|The mountain vista took our breath away.",
"wharf|a dock where ships load and unload|Fishing boats tied up at the wharf.",
"witty|clever and funny|His witty joke made everyone laugh.",
"acorn|the nut of an oak tree|The squirrel buried an acorn.",
"amber|a golden color, or hardened tree sap|The amber held a tiny ancient insect.",
"bison|a large, shaggy wild ox|A herd of bison crossed the prairie.",
"blaze|a bright, strong fire|The blaze lit up the night sky.",
"bonus|something extra|We got a bonus level in the game.",
"brine|very salty water|Pickles soak in brine.",
"easel|a stand that holds a painting|She set her canvas on the easel.",
"gecko|a small lizard that can climb walls|The gecko clung to the window.",
"heron|a tall bird that wades in water|The heron stood still on one leg.",
"igloo|a dome-shaped house made of snow blocks|We built a small igloo in the yard.",
"kayak|a narrow boat moved with a paddle|We paddled a kayak across the bay.",
"lilac|a shrub with sweet-smelling purple flowers|The lilac bloomed by the gate.",
"mango|a sweet, juicy tropical fruit|The mango was ripe and golden.",
"moose|a large deer with wide, flat antlers|A moose waded into the lake.",
"nomad|a person who moves from place to place|The nomad traveled with his camels.",
"quail|a small, plump bird|A quail scurried under the bush.",
"raven|a large, black, clever bird|The raven cawed from the treetop.",
"rodeo|a show of cowboy skills like riding|We cheered at the rodeo.",
"scuba|gear that lets you breathe underwater|Scuba divers explored the reef.",
"shrub|a small bush|Plant the shrub near the fence.",
"sonar|a way to find things underwater using sound|Dolphins use a kind of sonar.",
"trout|a freshwater fish|Grandpa caught a trout in the stream.",
"vowel|a letter like a, e, i, o or u|Every word has at least one vowel.",
"yeast|tiny living things that make bread rise|Yeast makes the dough puff up.",
"alarm|a signal that warns of danger|The fire alarm rang during the drill.",
"arena|a large area for sports or shows|The arena was packed with fans.",
"badge|a pin or patch that shows a rank or award|She earned a badge for camping.",
"canoe|a light, narrow boat moved with paddles|We paddled the canoe down the river.",
"cliff|a high, steep face of rock|Seabirds nest on the cliff.",
"crane|a tall bird, or a machine that lifts things|A crane lifted the steel beams."];
  // more allowed guesses (every answer word is allowed too)
  const MORE = (
'abbey abide abode about above abyss ached aches acrid acted actor acute added adept admin admit adobe adopt ' +
'adore adult affix afire afoot after again agape agate agent aging aglow agony agree ahead aided aimed aisle ' +
'album algae alien align alike alive alley allow alloy aloft alone along aloud alpha amaze amend amino amiss ' +
'among amply amuse angel anime ankle annex annoy antic anvil aorta apart apnea apply apron aptly arbor ardor ' +
'arise armor aroma array arrow ashen aside asked askew aspen assay atoll atoms attic audio audit aural avail ' +
'avert avian await awake award awful axiom bacon badly bagel baggy bakes balls balmy banal bands banjo banks ' +
'barge barns baron based basic basil basis baste batch bayou beads beady beams beans bears beast beats beech ' +
'beefy befit began beget begin begun beige being belie belly below belts bench beret berry bevel bezel bikes ' +
'bilge bills bingo biome biped birch birds birth black blade blame bland blank blare blast bleak bleep bless ' +
'blimp blind blink bliss bloat blobs blond blown blues bluff blunt blurb blurt blush boats bones bongo books ' +
'boost booth boots bored borne bossy bough bound bowls boxed boxer boxes brace braid brain brake brand brash ' +
'brass bravo brawl brawn break breed briar brick bride brief bring brink briny broad broil broke brood brook ' +
'broth brute buddy budge buggy bugle built bulbs bulge bulky bumpy bunch burly burnt burst buxom buyer bytes ' +
'cabby cable cacao cache cadet cagey cakes calls calms cameo camps canny canon caper caput carat cards cared ' +
'carol carry carts carve cases cater catty caulk cause caves cello cents chafe chaff chain champ chant chaos ' +
'charm chase chasm cheap cheat check cheek chess chest chewy chief child chili chill chime chimp chips chirp ' +
'choir chore chose chump chunk churn cider cinch civil clamp clams clang clash clasp claws clear cleat ' +
'clerk click cling clink cloak close cloth clout clove clubs clued clues clump coats cocky codec coins colon ' +
'colts comfy comic comma conch condo cooed cords corgi corny cough could count coupe court cover covey cower ' +
'coyly crabs crack cramp crank crash crass crate crawl craze crazy creak creep crepe crews cribs cried crimp ' +
'croak croon crops cross croup crowd cruel crumb crush crust crypt cubby cubes cubic cumin cupid cuppa curio ' +
'curls curly curry cycle cynic daddy daily dairy dally dandy dared dates datum daunt dealt dears debit decal ' +
'decks decor decoy decry defer deign deity delve demur denim dents depot derby desks deter detox diary dicey ' +
'dimly diner dingy diode dirge disco ditch ditto ditty diver dizzy docks dodge dodgy dogma doing dolls dolly ' +
'donut doors dorky dough dowdy dowel dowry drain drake drama drank drape drawl drawn draws dread dregs dried ' +
'drier drill drink drive drone droop drops dross drove druid drums dryer duchy ducks dully dumpy dunes dusky ' +
'dusty duvet dwarf eaten eater ebbed ebony edged edges edify eerie egged egret eject elate elder elegy elfin ' +
'elite elope elude elves email embed emcee empty enact ended endow enemy enjoy ennui ensue enter entry envoy ' +
'epoch epoxy equip error erupt ethic ethos etude evade every evict evoke exalt excel exert exile exist expat ' +
'expel extol extra exult faced faces facet facts faded fails faint faith false fancy farce farms favor ' +
'feeds feels feign femur fenny feral ferns ferry fetch fetid fever fewer fibre fiend fiery fifes fifth fifty ' +
'fight filed files fills filly films filth final finch finds fined finer fires fishy fixed fizzy fjord flags ' +
'flail flake flaky flame flank flaps flare flash flask flats flick flier flies fling flips flirt flood flora ' +
'floss flout flows fluff fluid fluke flume flung foamy foggy folds folks folly fonts foods foray force forks ' +
'forms forte forth forty forum found foxes foyer frame frank freed fried fries frill frisk frogs frond front ' +
'froth froze fudge fully fumes funds fungi fussy fuzzy gable gaffe gaily gains gamer games gamut gaudy gaunt ' +
'gauze gavel gawky gears geese genie ghoul giddy gifts gills girls girth given gives glade gland glare glass ' +
'glaze glean glint gloom glory gloss glows glued glyph gnash gnome goals goats godly going golds golem golly ' +
'goods goody gooey goofy gorge gouge gourd grace grail grand grant graph grate grave gravy grays graze greed ' +
'greet grill grime grind grins gripe groom group grout grove growl grown grows gruff grunt guava guess guest ' +
'guild guile gulls gully gumbo gummy gusto haiku hairs hairy halls hands handy hardy harps hasty haunt hawks ' +
'hazel heads heard heavy hedge heels hefty heist helix helps hence herbs herds hills hinge hippo hippy hitch ' +
'hoard hobby hoist hokey holds holes holly homer homey hoods hooks hoops hoped hopes horde horns hosts hotel ' +
'hotly hound hours hovel hover howdy human humor humph humus hunch hurry husky hutch hydra hyena hyper icily ' +
'icing icons ideas idiom idler idyll imbue impel imply inane inbox inept inert infer ingot inlay inner input ' +
'ionic irate irony issue itchy items ivory jaunt jazzy jeans jerky jetty jewel jiffy jimmy joins joint joist ' +
'joker jokes joust juicy jumbo jumps jumpy juror keeps ketch khaki kicks kinds kings kiosk kites knave knead ' +
'kneed kneel knees knelt knobs knock knots known knows kudos labor laced laces ladle laity lakes lambs lamps ' +
'lands lanes lanky lapel lapse larva laser lasso latch latte lawns layer leach leads leafy leaks leant lease ' +
'least leave ledge leech leery lefty legal lemma lemur level libel liege liked likes limbo limbs lined linen ' +
'liner lines lingo links lions lipid lists liter lithe lived liver lives livid loads loafs loamy loath lobby ' +
'local locks locus lodge looks loops loopy loose lorry lotus lousy loved lover loves lower lowly lucid lumen ' +
'lumpy lunge lungs lurch lurid lying macaw madam magma maids maize maker makes males mambo mange mania manic ' +
'manor march marry masks mason match mates matey matte mauve maxim maybe mayor meals mealy meant meats medal ' +
'media melee mends menus merch mercy merge merry messy metro midge midst might mills mince minds mined miner ' +
'minim minty minus miser misty mixed mixer mixes mocha modal modem mogul molar molds moldy monks moods moody ' +
'moral mossy motel moths motif mound mount mourn moved mover moves movie mower mucky muddy mulch mules mummy ' +
'munch mural murky mushy musty mynah myrrh nacho nadir nails naive named names nanny nasty natal naval navel ' +
'needs needy neigh nerdy nests never newer newly nicer niche niece ninja ninth nobly nodes noise noose nosey ' +
'notch noted notes nudge nutty nylon oaken occur ocher octet oddly offal offer often oiled okapi olden olive ' +
'omega onset oomph opens opine optic orate order other ought ounce outdo outer outgo ovate ovens ovoid owing ' +
'owned owner oxide ozone paced packs paddy pages pains pairs paler palms panic pansy pants papal parch parka ' +
'parks parry parts paste pasty patch paths patio patsy paved payee peace peaks peaky pearl pears pecan pedal ' +
'peels penal penne penny peony perch perky pesky petal petty phony photo picks picky piece piety piggy pilaf ' +
'pinch pines piney pinky pinto pints pious piper pipes pique pithy pivot pixel pixie place plaid plait plank ' +
'plans plays plaza pleat plier plots plows pluck plumb plump plums plush poems poets point poked poker poles ' +
'polka polyp ponds pooch pools poppy posed poses posse posts pouty power prank prawn press price prick pride ' +
'prime primo primp print prior privy prize prone prong props prose prove prowl proxy prude prune pudgy puffy ' +
'pulpy pulse pumps punch pupal pupil puree purer purge purse pushy putty quack quaff quake qualm quart quash ' +
'quell queue quick quill quirk quite quota quote rabbi rabid racer races radii rafts rails raise rajah rally ' +
'ramen ramps range ranks rarer raspy rated rates ratty rayon reach react ready rearm rebar rebus recur recut ' +
'reeds reels refer regal rehab reign relax remit remix renal renew repay repel rerun reset resin retch retro ' +
'revel rhino rider right rigor rinse ripen risen riser risky roach roads roast rocks rocky roger rogue roles ' +
'rolls rondo roomy roost roots ropes roses rotor rouge rough route rover rowdy royal ruddy rugby ruins ruled ' +
'rules rumba rummy rumor runny rusty sable sadly safer sails saint sales salon salsa salve sandy saner sappy ' +
'sassy satin sauce sauna saute saved saves savvy scald scalp scaly scamp scant scare scary scoff scold scone ' +
'scoop scoot scope score scorn scour scowl scram scrap scrub scrum seals seams seats sedan seeds seedy seems ' +
'seize sells sends sense sepia serif serum setup shack shady shaft shake shaky shale shall shame shank shape ' +
'shard sharp shave shawl shear sheen sheet shied shift shine shiny ships shire shirk shoal shock shoes shone ' +
'shook shoot shops shorn shove shown shows showy shrew shrug shuck shush sides sieve sigma signs silky since ' +
'sinew singe siren sitar sixth sixty sized sizes skein skier skies skiff skimp skulk skull slabs slack slang ' +
'slant slate sleds sleek slept slice slick slime slimy sling slink slosh sloth slots slows slump slunk slurp ' +
'slush slyly smack smash smear smelt smirk smite smock smoke smoky snaps snare sneak sneer snide sniff snoop ' +
'snore snort snout soapy sober socks sofas soggy songs sooty sorts souls soups spade spasm spate spawn speak ' +
'spear speck speed spend spent spicy spied spiel spike spiky spill spilt spins spiny spite splat split spoil ' +
'spoke spoof spore spots spout spray spree sprig spunk spurt squat squib stack staff staid stain stair stake ' +
'stale stalk stall stand stank stare stark stars start stash state stays stead steak steal steam steed steel ' +
'stein stems steps stiff still stilt sting stink stint stirs stock stoic stoke stomp stony stood stool stoop ' +
'stops stork stout stove strap straw strew strip strum strut stuck studs study stuff stump stung stunk stunt ' +
'suave suits sully sumac super surer surly sushi swami swans swarm swath swear sweat swell swept swill swims ' +
'swine swirl swoon swoop sworn synod synth syrup tabby taboo tacit tacky tacos taffy tails taken takes tales ' +
'talks tally talon tamer tango tangy tanks taper tapes tapir tardy tarot tarry tasty tatty taunt tawny teams ' +
'tears teary tease teens teeth tends tenet tenor tense tenth tents tepid terms terse tests theft their there ' +
'these thick thief thigh thing those threw thump thyme tiara tibia tight tilde tiles timer times timid titan ' +
'title toads tonal tones tonic tools topaz torch torso total totem tough tours tower towns toxic toxin track ' +
'trade trash trawl treat trees triad trice trick tried tries trims trios tripe trips trite troll troop ' +
'trope truce truly trump truss trust tubas tubes tulle tummy tunas tuned tuner tunes tunic turns tutor twang ' +
'tweak tweed tweet twice twigs twine twins twirl twist typed types udder ultra umbra uncle uncut under undid ' +
'undue unfed unfit unify union unity unlit unmet unset untie until unwed unzip upend upper upset usage using ' +
'usual usurp utile utter vague valor valve vapid vaunt vegan veils veldt venom venue verbs verge vicar video ' +
'views vigil villa vines vinyl viola viper viral visor vixen vogue voila voted voter vouch vowed vying wacky ' +
'wafer wages waist waits waive waken walks walls waltz wands wants warms warns washy waste waved waves waxed ' +
'waxen weave wedge weeds weedy weeks weigh weird wells whelp where which whiff while whine whiny whisk whole ' +
'whose widen wider widow width wight wimpy wince winch winds wings winks wiped wiper wired wires wiser wispy ' +
'witch wives woken woman women woods woody wooer wooly woozy words wordy works worms worry worse worst worth ' +
'would wrack wrath wreak wreck wrist wrong wrote wrung wryly yacht yards yarns yawns yearn years yells yodel ' +
'young yours youth yummy zeros zippy zonal zones ');
  const parse = list => list.map(s => { const [w, m, x] = s.split('|'); return {w, m, x}; });
  let ALLOWED = null; // built once, on first start
  function allowed(){
    if (ALLOWED) return ALLOWED;
    ALLOWED = new Set(MORE.split(' ').filter(Boolean));
    G3.concat(G5).forEach(s => ALLOWED.add(s.slice(0, 5)));
    return ALLOWED;
  }
  // Two-pass scoring: 2 = right letter, right spot; 1 = in the word, wrong spot; 0 = not in the word.
  // Exact matches use up their letters first, so a repeated guess letter is only marked as often as the secret holds it.
  function scoreGuess(guess, secret){
    const res = [0, 0, 0, 0, 0], left = {};
    for (let i = 0; i < LEN; i++){ if (guess[i] === secret[i]) res[i] = 2; else left[secret[i]] = (left[secret[i]] || 0) + 1; }
    for (let i = 0; i < LEN; i++){ if (res[i] !== 2 && left[guess[i]] > 0){ res[i] = 1; left[guess[i]]--; } }
    return res;
  }
  // readable text on a theme colour
  function lum(c){
    const d = document.createElement('div'); d.style.color = c; document.body.appendChild(d);
    const m = getComputedStyle(d).color.match(/[\d.]+/g) || [128, 128, 128]; d.remove();
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(+m[0]) + 0.7152 * f(+m[1]) + 0.0722 * f(+m[2]);
  }
  const inkOn = c => lum(c) > 0.32 ? '#1f1d24' : '#ffffff';

  window.BreakGames.wordguess = {
    start(el, api){
      const C = api.colors || {}, RM = !!api.reducedMotion;
      const offs = [], timers = new Set();
      let dead = false;
      const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
      const after = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };
      const mk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
      const store = api.store || {get(){}, set(){}};
      const grade5 = !(api.grade <= 3);
      const LIST = parse(grade5 ? G5 : G3), WORDS = allowed();
      const usedKey = grade5 ? 'used5' : 'used3';
      const good = C.good || '#2f9e57', sun = C.sun || '#f0b429', miss = C.mut || '#8a8577';
      const goodInk = inkOn(good), sunInk = inkOn(sun), missInk = inkOn(miss);

      // ---- saved data ----
      const stats = Object.assign({played:0, solved:0, streak:0, best:0, clues:0, dist:[0, 0, 0, 0, 0, 0]}, store.get('stats') || {});
      if (!Array.isArray(stats.dist) || stats.dist.length !== TRIES) stats.dist = [0, 0, 0, 0, 0, 0];
      let helpOpen = store.get('help') !== false;

      // ---- styles (scoped by the wg- prefix; removed with el) ----
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden'; el.style.userSelect = 'none'; el.style.webkitUserSelect = 'none';
      const st = mk('style');
      st.textContent = `
.wg{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:10px 12px 12px;box-sizing:border-box;font-family:${TF};color:#2a2630;
  background:radial-gradient(ellipse at 50% 35%,rgba(255,220,170,.22),transparent 65%),repeating-linear-gradient(92deg,rgba(0,0,0,.05) 0 3px,transparent 3px 11px,rgba(255,255,255,.035) 11px 13px,transparent 13px 27px),linear-gradient(160deg,#8d5d38,#6b4226)}
.wg *{box-sizing:border-box}
.wg button{font-family:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wg-top{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.wg-case{display:flex;align-items:center;gap:8px;min-width:0;flex:1 1 auto;color:#fff4e0;font:800 22px/1 ${HF};text-shadow:0 2px 2px rgba(0,0,0,.35);white-space:nowrap;overflow:hidden}
.wg-case .wg-mag{font-size:28px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}
.wg-tb{min-height:44px;min-width:44px;padding:0 12px;border-radius:12px;border:2px solid #d9c49c;background:#fff8ea;color:#2a2630;font:700 17px ${HF};box-shadow:0 3px 0 rgba(0,0,0,.25);white-space:nowrap}
.wg-tb:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.25)}
.wg-tb[disabled]{opacity:.62;cursor:default}
.wg-q{font:800 22px ${HF}}
.wg.wg-narrow .wg-tb{padding:0 9px;font-size:16px}
.wg.wg-narrow .wg-case{font-size:19px;gap:4px}
.wg.wg-narrow .wg-mag{display:none}
.wg.wg-narrow .wg-help{font-size:13px;gap:4px 8px}
.wg.wg-narrow .wg-key.wg-wide{font-size:13px;text-transform:none}
.wg.wg-narrow .wg-kr{gap:4px}
.wg-tb.wg-used{background:#fff2a8;border-color:#e2c75a}
.wg-help{flex:0 0 auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:rgba(255,248,234,.94);border-radius:10px;padding:5px 6px 5px 10px;font:500 14px/1.3 ${TF};color:#2a2630;box-shadow:0 2px 0 rgba(0,0,0,.2)}
.wg-help .wg-leg{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.wg-help .wg-mini{position:relative;width:24px;height:24px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font:800 14px ${HF};border:1.5px solid rgba(0,0,0,.18)}
.wg-help .wg-x{margin-left:auto;min-width:44px;min-height:36px;border-radius:9px;border:1.5px solid #d9c49c;background:#fff;font:700 14px ${TF};color:#2a2630}
.wg-note{flex:0 0 auto;align-self:center;max-width:100%;min-height:32px;padding:5px 14px;border-radius:6px;background:#fff1a6;color:#2a2630;font:600 16px/1.3 ${TF};text-align:center;box-shadow:0 3px 6px rgba(0,0,0,.25);transform:rotate(-.6deg)}
.wg-note.wg-warn{background:#ffd6c9}
.wg-wrap{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}
.wg-folder{position:relative;background:linear-gradient(#efd298,#e3c07f);border-radius:6px 12px 12px 12px;padding:var(--fp);box-shadow:0 8px 18px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:var(--g)}
.wg-folder::before{content:'CASE FILE';position:absolute;left:0;top:-18px;height:20px;padding:0 12px;border-radius:8px 8px 0 0;background:#efd298;font:800 11px/21px ${TF};letter-spacing:.12em;color:#7a5a24}
.wg-row{display:flex;gap:var(--g)}
.wg-tile{position:relative;width:var(--t);height:var(--t);border-radius:5px;display:flex;align-items:center;justify-content:center;font:800 calc(var(--t)*.56)/1 ${HF};text-transform:uppercase;color:#262430;
  background:linear-gradient(transparent 0 18%,#e59a9a 18% calc(18% + 1.5px),transparent 0),repeating-linear-gradient(transparent 0 calc(var(--t)*.2 - 1px),#c9dcef calc(var(--t)*.2 - 1px) calc(var(--t)*.2)),#fffdf5;
  box-shadow:0 2px 3px rgba(0,0,0,.28);border:1px solid rgba(0,0,0,.08)}
.wg-tile.wg-full{box-shadow:0 0 0 2px #6b4f2a,0 3px 5px rgba(0,0,0,.3)}
.wg-tile.wg-pop{animation:wgPop .12s ease-out}
.wg-tile.wg-s2{background:${good};color:${goodInk};border-color:rgba(0,0,0,.15)}
.wg-tile.wg-s1{background:${sun};color:${sunInk};border-color:rgba(0,0,0,.15)}
.wg-tile.wg-s0{background:${miss};color:${missInk};border-color:rgba(0,0,0,.15)}
.wg-badge{position:absolute;top:-6px;right:-6px;width:calc(var(--t)*.36);height:calc(var(--t)*.36);min-width:16px;min-height:16px;border-radius:50%;background:#fff;color:#1f1d24;border:1.5px solid rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:900 calc(var(--t)*.22)/1 ${TF};box-shadow:0 1px 2px rgba(0,0,0,.3)}
.wg-mini .wg-badge{width:13px;height:13px;min-width:13px;min-height:13px;top:-5px;right:-5px;font-size:9px}
.wg-flip{animation:wgFlip .42s ease-in-out}
.wg-shake{animation:wgShake .42s ease-in-out}
.wg-hop{animation:wgHop .5s ease-out}
@keyframes wgPop{50%{transform:scale(1.1)}}
@keyframes wgFlip{0%{transform:rotateX(0)}50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}
@keyframes wgShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
@keyframes wgHop{40%{transform:translateY(-12px)}70%{transform:translateY(2px)}}
.wg-kb{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;align-items:center}
.wg-kr{display:flex;gap:5px;width:100%;max-width:640px;justify-content:center}
.wg-key{position:relative;flex:1 1 0;max-width:58px;min-width:0;height:var(--kh);min-height:44px;padding:0;border-radius:8px;border:1px solid rgba(0,0,0,.18);background:#fbf5e9;color:#262430;font:800 calc(var(--kh)*.42)/1 ${HF};text-transform:uppercase;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.wg-key:active,.wg-key.wg-down{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.3)}
.wg-key.wg-wide{flex:1.6 1 0;max-width:96px;font-size:calc(var(--kh)*.3)}
.wg-key.wg-s2{background:${good};color:${goodInk}}
.wg-key.wg-s1{background:${sun};color:${sunInk}}
.wg-key.wg-s0{background:${miss};color:${missInk}}
.wg-key .wg-badge{width:15px;height:15px;min-width:15px;min-height:15px;top:-4px;right:-4px;font-size:9px}
.wg-ov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(30,18,8,.45)}
.wg-card{position:relative;background:${C.panel || '#fff'};color:${C.ink || '#222'};border:2px solid ${C.line || '#ccc'};border-radius:22px;padding:18px 20px;width:100%;max-width:520px;max-height:100%;overflow:auto;box-shadow:0 14px 44px rgba(0,0,0,.4);display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;font-family:${TF}}
.wg-card h3{margin:0;font:800 30px/1.1 ${HF}}
.wg-stamp{position:absolute;top:12px;right:14px;transform:rotate(12deg);border:3px solid #c0392b;color:#c0392b;border-radius:8px;padding:2px 8px;font:900 15px/1.2 ${TF};letter-spacing:.1em;opacity:.85}
.wg-ans{display:flex;gap:6px;--t:46px}
.wg-mean{font:600 18px/1.35 ${TF}}
.wg-ex{font:400 16px/1.4 ${TF};color:${C.mut || '#666'};font-style:italic}
.wg-ex b{color:${C.ink || '#222'};font-style:normal}
.wg-sub{font:500 15px/1.35 ${TF};color:${C.mut || '#666'}}
.wg-big{min-height:56px;width:min(320px,100%);border-radius:18px;font:700 22px ${HF};background:${C.accent || '#4b6bfb'};color:${C.accentInk || '#fff'};border:3px solid ${C.accent || '#4b6bfb'}}
.wg-small{min-height:48px;width:min(320px,100%);border-radius:16px;font:700 18px ${HF};background:${C.soft || '#eee'};color:${C.ink || '#222'};border:2px solid ${C.line || '#ccc'}}
.wg-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%}
.wg-stat{background:${C.soft || '#f2f2f2'};border-radius:12px;padding:8px 4px}
.wg-stat b{display:block;font:800 26px/1.1 ${HF}}
.wg-stat span{font:500 12px/1.2 ${TF};color:${C.mut || '#666'}}
.wg-dist{width:100%;display:flex;flex-direction:column;gap:4px}
.wg-bar{display:flex;align-items:center;gap:6px;font:700 14px ${TF}}
.wg-bar i{display:block;height:22px;min-width:26px;border-radius:6px;background:${C.mut || '#999'};color:${inkOn(C.mut || '#999')};font:700 13px/22px ${TF};font-style:normal;text-align:right;padding:0 7px}
.wg-bar i.wg-now{background:${good};color:${goodInk}}
@media (prefers-reduced-motion: reduce){.wg-flip,.wg-shake,.wg-hop,.wg-pop{animation:none!important}}
`;
      el.appendChild(st);

      // ---- DOM ----
      const root = mk('div', 'wg'); el.appendChild(root);
      const top = mk('div', 'wg-top'); root.appendChild(top);
      const caseLbl = mk('div', 'wg-case'); top.appendChild(caseLbl);
      const mag = mk('span', 'wg-mag', '🔍'); const caseTxt = mk('span', '', 'Case #1'); caseLbl.append(mag, caseTxt);
      const clueBtn = mk('button', 'wg-tb', '🔍 Clue'); clueBtn.type = 'button';
      const statBtn = mk('button', 'wg-tb', '📊'); statBtn.type = 'button'; statBtn.setAttribute('aria-label', 'Stats');
      const helpBtn = mk('button', 'wg-tb wg-q', '?'); helpBtn.type = 'button'; helpBtn.setAttribute('aria-label', 'How to play');
      top.append(clueBtn, statBtn, helpBtn);
      const help = mk('div', 'wg-help'); root.appendChild(help);
      const mini = (cls, badge) => { const t = mk('span', 'wg-mini wg-tile ' + cls, 'A'); t.style.setProperty('--t', '24px'); if (badge){ const b = mk('span', 'wg-badge', badge); t.appendChild(b); } return t; };
      const leg = (t, txt) => { const s = mk('span', 'wg-leg'); s.append(t, mk('span', '', txt)); return s; };
      help.append(mk('span', '', 'Guess the 5-letter word in 6 tries.'),
        leg(mini('wg-s2', '✓'), 'right spot'), leg(mini('wg-s1', '●'), 'wrong spot'), leg(mini('wg-s0'), 'not in word'));
      const helpX = mk('button', 'wg-x', '✕'); helpX.setAttribute('aria-label', 'Hide how to play'); helpX.type = 'button'; help.appendChild(helpX);
      const note = mk('div', 'wg-note', ''); note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite'); root.appendChild(note);
      const wrap = mk('div', 'wg-wrap'); root.appendChild(wrap);
      const folder = mk('div', 'wg-folder'); wrap.appendChild(folder);
      const rows = [], tiles = [];
      for (let r = 0; r < TRIES; r++){
        const row = mk('div', 'wg-row'); folder.appendChild(row); rows.push(row); tiles.push([]);
        for (let c = 0; c < LEN; c++){ const t = mk('div', 'wg-tile'); t.style.transform = 'rotate(' + ((((r * 7 + c * 3) % 5) - 2) * 0.5) + 'deg)'; row.appendChild(t); tiles[r].push(t); }
      }
      const kb = mk('div', 'wg-kb'); root.appendChild(kb);
      const keys = {};
      ['qwertyuiop', 'asdfghjkl', '+zxcvbnm-'].forEach(line => {
        const kr = mk('div', 'wg-kr'); kb.appendChild(kr);
        for (const ch of line){
          const b = mk('button', 'wg-key'); b.type = 'button';
          if (ch === '+'){ b.textContent = 'Enter'; b.classList.add('wg-wide'); b.dataset.k = 'enter'; }
          else if (ch === '-'){ b.textContent = '⌫'; b.classList.add('wg-wide'); b.style.fontSize = 'calc(var(--kh)*.45)'; b.dataset.k = 'back'; b.setAttribute('aria-label', 'Delete'); }
          else { b.textContent = ch; b.dataset.k = ch; keys[ch] = b; }
          kr.appendChild(b);
        }
      });
      const ov = mk('div', 'wg-ov'); root.appendChild(ov);

      // ---- sizing ----
      function fit(){
        if (dead) return;
        const r = el.getBoundingClientRect();
        root.classList.toggle('wg-narrow', r.width < 520);
        const kh = Math.round(Math.max(44, Math.min(58, r.height * 0.072)));
        root.style.setProperty('--kh', kh + 'px');
        const w = wrap.getBoundingClientRect();
        const g = w.width < 380 ? 5 : 7, fp = w.width < 380 ? 10 : 14;
        const t = Math.floor(Math.max(26, Math.min(70, (w.width - fp * 2 - g * 4) / LEN, (w.height - 22 - fp * 2 - g * 5) / TRIES)));
        folder.style.setProperty('--t', t + 'px'); folder.style.setProperty('--g', g + 'px'); folder.style.setProperty('--fp', fp + 'px');
        folder.style.marginTop = '18px';
      }
      let ro = null;
      if (window.ResizeObserver){ ro = new ResizeObserver(() => fit()); ro.observe(el); ro.observe(wrap); }
      on(window, 'resize', fit); on(window, 'orientationchange', fit);

      // ---- game state ----
      let secret = null, guesses = [], typing = '', clueUsed = false, over = false, busy = false, ovMode = '', noteTimer = 0;
      const keyState = {};
      function pickWord(){
        let used = store.get(usedKey); if (!Array.isArray(used)) used = [];
        let pool = LIST.filter(e => !used.includes(e.w));
        if (!pool.length){ used = []; pool = LIST.slice(); }
        const e = pool[Math.floor(Math.random() * pool.length)];
        used.push(e.w); store.set(usedKey, used);
        return e;
      }
      const saveCur = () => store.set('cur', over ? null : {w:secret.w, g:guesses.slice(), clue:clueUsed, g5:grade5});
      function newCase(){
        hideOv();
        secret = pickWord(); guesses = []; typing = ''; clueUsed = false; over = false; busy = false;
        for (const k in keyState) delete keyState[k];
        saveCur(); paintAll(); showDefaultNote();
      }
      function resume(){
        const cur = store.get('cur');
        if (!cur || cur.g5 !== grade5 || !Array.isArray(cur.g)) return false;
        const e = LIST.find(x => x.w === cur.w); if (!e) return false;
        secret = e; guesses = cur.g.filter(g => typeof g === 'string' && g.length === LEN).slice(0, TRIES - 1); clueUsed = !!cur.clue; typing = ''; over = false;
        guesses.forEach(g => markKeys(g, scoreGuess(g, secret.w)));
        paintAll(); showDefaultNote(); return true;
      }

      // ---- painting ----
      function setTile(t, ch, s){
        t.textContent = ch || '';
        t.classList.remove('wg-s0', 'wg-s1', 'wg-s2', 'wg-full');
        if (s != null){ t.classList.add('wg-s' + s); if (s > 0) t.appendChild(mk('span', 'wg-badge', s === 2 ? '✓' : '●')); }
        else if (ch) t.classList.add('wg-full');
        t.setAttribute('aria-label', ch ? ch.toUpperCase() + (s === 2 ? ', right spot' : s === 1 ? ', in the word, wrong spot' : s === 0 ? ', not in the word' : '') : 'empty');
      }
      function paintRow(r){
        const g = guesses[r];
        if (g){ const sc = scoreGuess(g, secret.w); for (let c = 0; c < LEN; c++) setTile(tiles[r][c], g[c], sc[c]); }
        else if (r === guesses.length && !over){ for (let c = 0; c < LEN; c++) setTile(tiles[r][c], typing[c]); }
        else for (let c = 0; c < LEN; c++) setTile(tiles[r][c], '');
      }
      function paintKeys(){
        for (const ch in keys){
          const b = keys[ch], s = keyState[ch];
          b.classList.remove('wg-s0', 'wg-s1', 'wg-s2'); b.textContent = ch;
          if (s != null){ b.classList.add('wg-s' + s); if (s > 0) b.appendChild(mk('span', 'wg-badge', s === 2 ? '✓' : '●')); }
        }
      }
      function paintTop(){
        caseTxt.textContent = 'Case #' + (stats.played + 1);
        const can = clueReady();
        clueBtn.disabled = !can && !clueUsed;
        clueBtn.classList.toggle('wg-used', clueUsed);
        const narrow = el.getBoundingClientRect().width < 430;
        clueBtn.textContent = clueUsed ? '🔍 Clue ✓' : can ? '🔍 Clue' : (narrow ? '🔍 after 4' : '🔍 Clue after guess 4');
        help.style.display = helpOpen ? 'flex' : 'none';
        helpBtn.setAttribute('aria-pressed', helpOpen ? 'true' : 'false');
      }
      function paintAll(){ for (let r = 0; r < TRIES; r++) paintRow(r); paintKeys(); paintTop(); fit(); }
      function markKeys(g, sc){ for (let i = 0; i < LEN; i++){ const ch = g[i]; if (keyState[ch] == null || sc[i] > keyState[ch]) keyState[ch] = sc[i]; } }
      const clueReady = () => !over && (!grade5 || guesses.length >= 4);
      function showDefaultNote(){
        clearTimeout(noteTimer); timers.delete(noteTimer);
        note.classList.remove('wg-warn');
        if (clueUsed && secret) note.textContent = '🔍 Clue: ' + secret.m;
        else if (over) note.textContent = '';
        else note.textContent = guesses.length === 0 ? '🕵️ ' + (api.name ? api.name + ', a' : 'A') + ' new case! Guess 1 of 6' : 'Guess ' + (guesses.length + 1) + ' of 6';
      }
      function flash(msg, warn){
        clearTimeout(noteTimer); timers.delete(noteTimer);
        note.textContent = msg; note.classList.toggle('wg-warn', !!warn);
        noteTimer = after(1800, showDefaultNote);
      }

      // ---- input ----
      function press(k){
        if (dead) return;
        if (ovMode){ if (k === 'enter') { if (ovMode === 'end') newCase(); else hideOv(); } return; }
        if (over || busy) return;
        if (k === 'enter') return submit();
        if (k === 'back'){ if (typing.length){ typing = typing.slice(0, -1); paintRow(guesses.length); } return; }
        if (/^[a-z]$/.test(k) && typing.length < LEN){
          typing += k; paintRow(guesses.length);
          const t = tiles[guesses.length][typing.length - 1];
          if (!RM){ t.classList.remove('wg-pop'); void t.offsetWidth; t.classList.add('wg-pop'); }
        }
      }
      function shake(row){ if (RM) return; row.classList.remove('wg-shake'); void row.offsetWidth; row.classList.add('wg-shake'); after(450, () => row.classList.remove('wg-shake')); }
      function submit(){
        const r = guesses.length, row = rows[r];
        if (typing.length < LEN){ flash('Not enough letters', true); shake(row); return; }
        if (!WORDS.has(typing)){ flash('Not in my word list', true); shake(row); return; }
        const g = typing, sc = scoreGuess(g, secret.w);
        guesses.push(g); typing = '';
        const won = g === secret.w, lost = !won && guesses.length >= TRIES;
        if (won || lost) over = true;
        saveCur();
        busy = true;
        const step = RM ? 0 : 230;
        for (let c = 0; c < LEN; c++){
          const t = tiles[r][c];
          if (RM){ setTile(t, g[c], sc[c]); continue; }
          after(c * step, () => { t.classList.remove('wg-flip'); void t.offsetWidth; t.classList.add('wg-flip'); });
          after(c * step + 210, () => setTile(t, g[c], sc[c]));
        }
        after(LEN * step + 240, () => {
          tiles[r].forEach(t => t.classList.remove('wg-flip'));
          markKeys(g, sc); paintKeys(); busy = false;
          if (won) win(r); else if (lost) lose(); else { paintTop(); showDefaultNote(); if (grade5 && guesses.length === 4 && !clueUsed) flash('🔍 A clue is ready if you want one!'); }
        });
      }

      // ---- end of a case ----
      function finish(won){
        stats.played++;
        if (won){ stats.solved++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); stats.dist[guesses.length - 1]++; if (clueUsed) stats.clues++; }
        else stats.streak = 0;
        store.set('stats', stats); store.set('cur', null);
        let res = null;
        // score = cases solved so far (higher is better). A first-ever case that was not solved is not saved, so a loss never sets a "best".
        if (won || api.best != null) res = api.saveScore(stats.solved);
        return res;
      }
      function win(r){
        const res = finish(true);
        if (!RM){ tiles[r].forEach((t, i) => after(i * 90, () => { t.classList.remove('wg-hop'); void t.offsetWidth; t.classList.add('wg-hop'); })); }
        // the shell already throws confetti for a new best; add our own only when it did not
        if (!RM && !(res && res.isBest)) api.confetti && api.confetti(50);
        note.classList.remove('wg-warn'); note.textContent = ['Brilliant!', 'Amazing!', 'Great detective work!', 'Nice work!', 'Got it!', 'Phew, just in time!'][guesses.length - 1];
        after(RM ? 300 : 1100, () => endCard(true, res));
      }
      function lose(){
        const res = finish(false);
        note.classList.remove('wg-warn'); note.textContent = 'Out of guesses…';
        after(RM ? 300 : 900, () => endCard(false, res));
      }
      function exampleNode(e){
        const p = mk('div', 'wg-ex'), re = new RegExp('(' + e.w + '\\w*)', 'i'), parts = e.x.split(re);
        p.append('“');
        parts.forEach((s, i) => { if (i % 2) p.appendChild(mk('b', '', s)); else if (s) p.append(s); });
        p.append('”'); return p;
      }
      function wordTiles(w, s){ const d = mk('div', 'wg-ans'); for (const ch of w){ const t = mk('div', 'wg-tile'); setTile(t, ch, s); d.appendChild(t); } return d; }
      function endCard(won, res){
        const card = mk('div', 'wg-card');
        if (won){ card.appendChild(mk('div', 'wg-stamp', 'SOLVED')); card.appendChild(mk('div', '', '🕵️')).style.fontSize = '42px'; card.appendChild(mk('h3', '', 'Case closed!')); }
        else { card.appendChild(mk('div', '', '🔎')).style.fontSize = '42px'; card.appendChild(mk('h3', '', 'So close, detective!')); card.appendChild(mk('div', 'wg-sub', 'The secret word was …')); }
        card.appendChild(wordTiles(secret.w, won ? 2 : null));
        card.appendChild(mk('div', 'wg-mean', secret.w.charAt(0).toUpperCase() + secret.w.slice(1) + ': ' + secret.m));
        card.appendChild(exampleNode(secret));
        const bits = [];
        if (won) bits.push('Solved in ' + guesses.length + ' guess' + (guesses.length > 1 ? 'es' : '') + (clueUsed ? ', with a clue 🔍' : ''));
        bits.push('Cases solved: ' + stats.solved + (stats.streak > 1 ? ' · Streak: ' + stats.streak : ''));
        bits.forEach(b => card.appendChild(mk('div', 'wg-sub', b)));
        if (won && res && res.isBest && stats.solved > 1) card.appendChild(mk('div', 'wg-sub', '🏆 Most cases solved ever!')).style.color = good;
        const next = mk('button', 'wg-big', 'Next case'); next.type = 'button'; next.dataset.act = 'next';
        on(next, 'click', () => newCase());
        const sb = mk('button', 'wg-small', '📊 My detective stats'); sb.type = 'button';
        on(sb, 'click', () => statsCard(true));
        card.append(next, sb);
        showOv(card, 'end');
      }
      function statsCard(fromEnd){
        const card = mk('div', 'wg-card');
        card.appendChild(mk('h3', '', '📊 Detective stats'));
        const grid = mk('div', 'wg-stats');
        [[stats.played, 'Cases'], [stats.solved, 'Solved'], [stats.streak, 'Streak'], [stats.best, 'Best streak']].forEach(([v, l]) => { const s = mk('div', 'wg-stat'); s.append(mk('b', '', String(v)), mk('span', '', l)); grid.appendChild(s); });
        card.appendChild(grid);
        card.appendChild(mk('div', 'wg-sub', 'Guesses it took'));
        const dist = mk('div', 'wg-dist'), mx = Math.max(1, ...stats.dist);
        stats.dist.forEach((n, i) => { const b = mk('div', 'wg-bar'); b.appendChild(mk('span', '', String(i + 1))); const bar = mk('i', '', String(n)); bar.style.width = Math.max(8, n / mx * 100) + '%'; if (fromEnd && over && guesses[guesses.length - 1] === secret.w && guesses.length === i + 1) bar.className = 'wg-now'; b.appendChild(bar); dist.appendChild(b); });
        card.appendChild(dist);
        if (stats.clues) card.appendChild(mk('div', 'wg-sub', 'Solved with a clue: ' + stats.clues));
        const close = mk('button', fromEnd ? 'wg-big' : 'wg-small', fromEnd ? 'Next case' : 'Back to the case'); close.type = 'button';
        on(close, 'click', () => fromEnd ? newCase() : hideOv());
        card.appendChild(close);
        showOv(card, fromEnd ? 'end' : 'stats');
      }
      function showOv(card, mode){ ov.innerHTML = ''; ov.appendChild(card); ov.style.display = 'flex'; ovMode = mode; }
      function hideOv(){ ov.style.display = 'none'; ov.innerHTML = ''; ovMode = ''; }

      // ---- wiring ----
      on(kb, 'click', e => { const b = e.target.closest('.wg-key'); if (b && b.dataset.k) press(b.dataset.k); });
      on(clueBtn, 'click', () => {
        if (!clueReady() || clueUsed) return;
        clueUsed = true; saveCur(); paintTop(); showDefaultNote();
      });
      on(statBtn, 'click', () => { if (ovMode === 'end') return; statsCard(false); });
      on(helpBtn, 'click', () => { helpOpen = !helpOpen; store.set('help', helpOpen); paintTop(); fit(); });
      on(helpX, 'click', () => { helpOpen = false; store.set('help', false); paintTop(); fit(); });
      on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
        const k = e.key;
        if (k === 'Enter'){ e.preventDefault(); press('enter'); }
        else if (k === 'Backspace'){ e.preventDefault(); press('back'); }
        else if (k === 'Escape' && ovMode === 'stats') hideOv();
        else if (/^[a-zA-Z]$/.test(k)) press(k.toLowerCase());
      });

      // test hook (read-only peek for automated tests)
      const hook = {get secret(){ return secret && secret.w; }, get guesses(){ return guesses.slice(); }, get over(){ return over; }, get busy(){ return busy; }, get stats(){ return JSON.parse(JSON.stringify(stats)); }, score:scoreGuess, has:w => WORDS.has(w), lists:{g3:G3.length, g5:G5.length, words:WORDS.size}};
      window.__wg = hook;

      if (!resume()) newCase();
      after(0, fit);

      return function cleanup(){
        dead = true;
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach(f => f()); offs.length = 0;
        if (ro) ro.disconnect();
        if (window.__wg === hook) delete window.__wg;
        el.innerHTML = '';
      };
    }
  };
})();
