# Contributing to Hacker Jeopardy Content

Welcome! We're excited that you want to contribute question sets to Hacker Jeopardy. This guide will help you create and submit new rounds.

## Table of Contents

- [Quick Start](#quick-start)
- [Round Structure](#round-structure)
- [Category Format](#category-format)
- [Question Guidelines](#question-guidelines)
- [Validation](#validation)
- [Submission Process](#submission-process)
- [Best Practices](#best-practices)

## Quick Start

1. **Fork** the content repository
2. **Create** a new round directory under `rounds/`
3. **Add** your round files following the structure below
4. **Test** your content using the validation script
5. **Submit** a Pull Request

## Round Structure

Each round should be organized as follows:

```
rounds/
└── your_round_id/
    ├── round.json          # Round metadata and category list
    ├── Category1/
    │   └── cat.json       # Category questions
    │   └── image1.jpg     # Optional images
    ├── Category2/
    │   └── cat.json
    └── ...
```

### Round ID Naming Convention

- Use lowercase letters, numbers, and underscores only
- Be descriptive but concise: `cybersecurity_basics`, `programming_fundamentals`
- Avoid special characters or spaces

## Round Metadata (`round.json`)

```json
{
  "name": "Cybersecurity Basics",
  "categories": ["Network Security", "Cryptography", "Social Engineering"],
  "comment": "Introduction to basic cybersecurity concepts",
  "author": "Your Name",
  "version": "1.0.0",
  "created": "2025-12-18"
}
```

**Required fields:**

- `name`: Display name for the round
- `categories`: Array of category names (must match directory names)

**Optional fields:**

- `comment`: Additional description
- `author`: Your name
- `version`: Version number
- `created`: Creation date

## Category Format (`cat.json`)

```json
{
  "name": "Network Security",
  "path": "Network Security",
  "lang": "en",
  "difficulty": "easy",
  "author": "Your Name",
  "licence": "MIT",
  "date": "2025-12-18",
  "email": "your.email@example.com",
  "questions": [
    {
      "answer": "What does HTTPS stand for?",
      "question": "HyperText Transfer Protocol Secure",
      "available": true
    },
    {
      "answer": "What type of attack involves tricking users into revealing sensitive information?",
      "question": "Phishing",
      "available": true
    }
  ]
}
```

**Required fields:**

- `name`: Category display name
- `questions`: Array of question objects

**Optional fields:**

- `path`: Directory path for images (usually same as name)
- `lang`: Language code (en, de, fr, etc.)
- `difficulty`: easy, medium, hard, or mixed
- `author`, `licence`, `date`, `email`: Metadata

## Question Guidelines

### Question Structure

Each question object should have:

```json
{
  "answer": "The clue text displayed to contestants",
  "question": "The correct contestant response (What is...?)",
  "available": true
}
```

### Content Guidelines

**Question Quality:**

- Questions should be clear and unambiguous
- Use proper grammar and spelling
- Avoid overly complex or obscure topics
- Ensure questions are educational and interesting

**Answer Quality:**

- Answers should be concise but complete
- Include brief explanations when helpful
- Use consistent formatting

**Difficulty Balance:**

- Easy: Basic concepts, common knowledge
- Medium: Intermediate understanding required
- Hard: Advanced or specialized knowledge

### Categories

**Popular Category Themes:**

- Programming languages and frameworks
- Cybersecurity concepts and tools
- Operating systems and commands
- Network protocols and infrastructure
- Famous hackers and events
- Internet culture and memes
- Science and technology history

## Content Creation Guidelines

### Game Mechanics

Hacker Jeopardy follows standard Jeopardy rules:

- **Clues**: Questions displayed to contestants (e.g., "What does HTTPS stand for?")
- **Answers**: Contestant responses (e.g., "HyperText Transfer Protocol Secure")
- **Categories**: 6 thematic groupings per round
- **Point Values**: 100, 200, 300, 400, 500 (difficulty scaling)
- **Answer Formats**: Flexible - text, images, or combinations

### Fun-First Approach

Questions should be engaging and entertaining while maintaining educational value:

- Use puns, wordplay, and pop culture references
- Include humor and clever analogies
- Make technical concepts accessible and memorable
- Balance entertainment with learning

### Visual Integration

- **40% of questions** should include relevant images
- Images enhance clues or provide answer context
- Support diagrams, memes, screenshots, and educational graphics
- Store images in category directories alongside `cat.json`

### Difficulty Scaling

Progressive difficulty based on point values:

- **100 points**: Common knowledge, basic concepts
- **200 points**: Standard practices, intermediate terms
- **300 points**: Practical applications, common techniques
- **400 points**: Specialized knowledge, specific technologies
- **500 points**: Expert principles, advanced concepts

### Category Naming Conventions

Replace standard technical names with engaging, thematic alternatives:

**Examples:**

- Network Security → "Firewall Follies"
- Cryptography → "Encryption Extravaganza"
- Web Security → "Web Weirdness"
- System Security → "Access Control Circus"
- Social Engineering → "Phishing Fiasco"
- Programming → "Code Catastrophes"
- Databases → "Data Disco"
- APIs → "API Adventure"

**Guidelines:**

- Keep names memorable and thematic
- Use alliteration when possible
- Ensure names reflect the category's fun personality
- Maintain clarity about technical content

### Development Workflow

1. **Planning Phase**
   - Define round theme and target audience
   - Brainstorm 6 fun category names
   - Outline question difficulty progression
   - Plan image content integration

2. **Content Creation**
   - Write clues with engaging language
   - Ensure progressive difficulty scaling
   - Add relevant images where helpful
   - Test question clarity and fun factor

3. **Quality Assurance**
   - Run `npm run validate` for JSON compliance
   - Verify difficulty scaling within categories
   - Check educational value and entertainment balance
   - Update manifest with `npm run build-manifest`

4. **Review & Iteration**
   - Test gameplay experience
   - Gather community feedback
   - Refine based on player engagement
   - Maintain consistent quality standards

### Quality Standards

**Question Criteria:**

- Engaging and fun language
- Clear educational value
- Appropriate difficulty for point value
- Technically accurate information
- Accessible to target audience

**Image Guidelines:**

- Relevant to clue or answer
- High quality and clear
- Optimized file size (<500KB)
- Proper licensing or original creation
- Accessible descriptions

**Category Balance:**

- 6 categories per round
- 5 questions per category (100-500 points)
- Mix of text and image-based content
- Progressive difficulty scaling

## Creating Good and Fun Jeopardy Questions

### Jeopardy Format Fundamentals

**Structure:**

- **Clue** (answer field): What contestants SEE on screen - should be descriptive and engaging
- **Response** (question field): What contestants SAY - must follow "What is...?", "Who is...?", "What are...?" format

**Example:**

```json
{
  "answer": "This cryptographic algorithm uses a 128-bit key and is widely considered unbreakable by classical computers",
  "question": "What is AES?"
}
```

### Principles for Great Jeopardy Questions

#### 1. **Engaging Clue Writing**

- **Be descriptive**: Don't just state facts - paint a picture
- **Use analogies**: Compare technical concepts to everyday things
- **Add personality**: Use vivid language and wordplay
- **Build curiosity**: Make contestants want to know the answer

**Bad Clue:** "A type of cyber attack"
**Good Clue:** "This malicious technique tricks users into revealing sensitive information by pretending to be a trustworthy entity"

#### 2. **Difficulty Scaling**

- **100 points**: Basic concepts, common knowledge
- **200 points**: Standard practices, intermediate terms
- **300 points**: Applied knowledge, working understanding
- **400 points**: Specialized knowledge, specific implementations
- **500 points**: Expert-level understanding, advanced concepts

#### 3. **Fun Factor Techniques**

**Wordplay & Puns:**

- "This firewall acts like a nightclub bouncer, deciding who gets in and who gets turned away"
- "Like a digital immune system, this security layer detects and blocks malicious activity"

**Analogies & Metaphors:**

- "This algorithm acts like a digital fingerprint, uniquely identifying data"
- "Like a secret handshake between computers, this protocol ensures secure communication"

**Pop Culture References:**

- "Like the Death Star's weakness, this vulnerability could bring down an entire system"
- "This coding error is like mixing up your Star Trek characters - a Kirk/Spock data type confusion"

**Humor & Exaggeration:**

- "This bug would make your computer slower than dial-up in the 1990s"
- "Like a zombie apocalypse for servers, this malware spreads uncontrollably"

#### 4. **Educational Balance**

**Teach While Entertaining:**

- Include accurate technical information
- Explain concepts through engaging scenarios
- Build on contestants' existing knowledge
- Avoid overwhelming with jargon

**Progressive Learning:**

- Start with fundamentals (100-200 points)
- Build complexity (300-400 points)
- Reward deep knowledge (500 points)

#### 5. **Category Cohesion**

**Theme Consistency:**

- Each category should have a clear, unified theme
- Questions should flow logically within the category
- Difficulty should scale smoothly
- Maintain consistent tone and style

**Fun Naming:**

- Use alliteration: "Firewall Follies", "Code Catastrophes"
- Employ puns: "Phishing Fiasco", "Password Party"
- Be memorable: "Hackers Hall of Fame", "Digital Doomsdays"

### Question Writing Workflow

#### Step 1: Choose Your Topic

- Select a technical concept or historical event
- Ensure it has educational value
- Consider how it relates to broader themes

#### Step 2: Craft the Response First

- Decide what the contestant will say
- Ensure it follows Jeopardy format ("What is...?")
- Make sure it's concise and definitive

#### Step 3: Build the Clue

- Write a descriptive, engaging clue
- Include context and vivid details
- Add fun elements (analogies, puns, humor)
- Ensure appropriate difficulty level

#### Step 4: Test & Refine

- Read the clue aloud - does it spark curiosity?
- Verify technical accuracy
- Check that the response naturally follows from the clue
- Ensure appropriate difficulty scaling

### Common Pitfalls to Avoid

#### Technical Jargon Overload

❌ "This asymmetric cryptographic algorithm uses elliptic curve mathematics"
✅ "Like a digital signature that only you can create but anyone can verify, this encryption method uses complex mathematical curves"

#### Spoiler Clues

❌ "The programming language created by Guido van Rossum"
✅ "This snake-named language emphasizes code readability and has a philosophy that there's only one obvious way to do things"

#### Too Vague

❌ "A security concept"
✅ "This principle ensures users have only the minimum permissions needed to perform their job, like giving house keys only to family members"

#### Too Obscure

❌ "The 1988 internet worm"
✅ "This self-replicating program infected 6,000 computers in 1988 and demanded money from victims, pioneering digital extortion"

### Quality Checklist

- [ ] **Jeopardy Format**: Clue in answer field, response in question field
- [ ] **Engaging Language**: Uses analogies, humor, or vivid descriptions
- [ ] **Educational Value**: Teaches something meaningful
- [ ] **Appropriate Difficulty**: Matches point value expectations
- [ ] **Technical Accuracy**: All facts are correct
- [ ] **Natural Flow**: Response naturally follows from clue
- [ ] **Category Fit**: Aligns with category theme and naming

## Creating Entertainment-Focused Rounds

While educational rounds teach technical concepts, entertainment-focused rounds prioritize fun, pop culture, and social engagement over learning objectives. These rounds create memorable gaming experiences through humor, nostalgia, and viral trends.

### Entertainment vs Education

**Entertainment Rounds:**

- **Goal**: Maximize fun and social interaction
- **Content**: Pop culture, memes, internet trends, humorous anecdotes
- **Accuracy**: Fun and shareability prioritized over technical precision
- **Audience**: Broad appeal, casual players, social gatherings

**Educational Rounds:**

- **Goal**: Teach technical concepts and build knowledge
- **Content**: Accurate technical information with clear explanations
- **Accuracy**: Technical precision and educational value required
- **Audience**: Students, professionals, skill development

### Entertainment Round Planning

#### Step 1: Choose Entertainment Theme

Select a fun, engaging theme that resonates with players:

- **Internet Culture**: Memes, viral trends, social media phenomena
- **Gaming**: Video games, esports moments, gaming culture
- **Pop Culture Tech**: Celebrity tech fails, movie references, tech in media
- **Nostalgia**: Retro computing, classic software, internet history
- **Humor**: Programming jokes, tech fails, industry satire

#### Step 2: Design Fun Categories

Create 6 thematic categories with entertaining names:

**Internet Culture Example:**

- "Meme Museum" - Classic internet memes
- "Viral Vortex" - Social media trends and challenges
- "Hashtag Havoc" - Social media drama and movements
- "Emoji Empire" - Digital communication quirks
- "TikTok Tornado" - Short-form video culture
- "Reddit Realms" - Online community phenomena

**Gaming Example:**

- "Boss Battle Blunders" - Epic gaming fails
- "Character Creation Chaos" - Ridiculous character builds
- "Speedrun Shenanigans" - Glitch exploits and tricks
- "Achievement Absurdities" - Unusual gaming achievements
- "Multiplayer Mayhem" - Online gaming horror stories
- "Retro Gaming Relics" - Classic game nostalgia

#### Step 3: Craft Entertaining Questions

**Question Types for Entertainment:**

- **Pop Culture References**: "This tech billionaire's failed Twitter acquisition became an internet meme"
- **Humorous Scenarios**: "What would happen if cats took over the internet?"
- **Viral Moments**: "This programming language's mascot inspired countless memes"
- **Nostalgic Trivia**: "The original iPhone launch caused this shopping website to crash"
- **Industry Drama**: "This tech company rivalry inspired a blockbuster movie"

**Entertainment Question Examples:**

**Category: Meme Museum (200 points)**

- Clue: "This cat photo with the caption 'I can has cheezburger' launched an entire language of lolcat speak"
- Response: "What is the original lolcat?"

**Category: Boss Battle Blunders (300 points)**

- Clue: "This video game boss fight became infamous for being so difficult that players needed external help"
- Response: "What is Dark Souls' Ornstein and Smough?"

**Category: Speedrun Shenanigans (400 points)**

- Clue: "This glitch in a classic platformer allows players to skip the entire game in under 5 seconds"
- Response: "What is Wrong Warp in Super Mario Bros.?"

### Entertainment Question Guidelines

#### Make It Shareable

- Questions should spark conversation after the game
- Include elements people want to discuss or debate
- Create memorable moments that players will reference later

#### Balance Difficulty

- **100 points**: Common viral moments, widely known memes
- **200 points**: Current trends, recent viral content
- **300 points**: Niche but entertaining trivia
- **400 points**: Deeper cuts, insider knowledge
- **500 points**: Rare or obscure entertaining facts

#### Focus on Fun Factors

- **Humor**: Puns, jokes, amusing anecdotes
- **Nostalgia**: Childhood memories, retro tech
- **Shock Value**: Surprising or counterintuitive facts
- **Relatability**: Experiences most people can connect with
- **Timeliness**: Current events and trending topics

### Quality Standards for Entertainment

#### Engagement Criteria

- [ ] **Shareability**: Players want to tell others about the question
- [ ] **Memorability**: Questions that stick in players' minds
- [ ] **Conversation Starter**: Sparks discussion or debate
- [ ] **Broad Appeal**: Accessible to diverse player backgrounds

#### Entertainment Balance

- [ ] **Humor Distribution**: Mix of different humor styles (puns, irony, absurdity)
- [ ] **Cultural Relevance**: References players can relate to
- [ ] **Timeliness**: Mix of current and timeless entertainment
- [ ] **Appropriateness**: Suitable for general audiences

#### Technical Quality (Still Important)

- [ ] **Jeopardy Format**: Proper clue/response structure maintained
- [ ] **Category Consistency**: Questions fit their category theme
- [ ] **Answer Precision**: Clear, definitive responses
- [ ] **Difficulty Scaling**: Logical progression within categories

### Entertainment Round Examples

#### Round Theme: "Internet Culture Madness"

**Categories:**

- "Meme Museum" - Classic internet memes
- "Viral Vortex" - Social media trends and challenges
- "Hashtag Havoc" - Social media drama and movements
- "Emoji Empire" - Digital communication quirks
- "Filter Fiascos" - Social media photo fails
- "Dance Challenge Disasters" - Viral dance trends gone wrong

**Sample Question (Meme Museum, 200 points):**

- Clue: "This cat photo with the caption 'I can has cheezburger' launched an entire language of lolcat speak"
- Response: "What is the original lolcat?"

#### Round Theme: "Gaming Glory & Fails"

**Categories:**

- "Boss Battle Blunders" - Infamous difficult fights
- "Character Creation Chaos" - Ridiculous character builds
- "Speedrun Shenanigans" - Glitch exploits and tricks
- "Achievement Absurdities" - Unusual gaming accomplishments
- "Multiplayer Mayhem" - Online gaming horror stories
- "Retro Gaming Relics" - Classic game nostalgia

### Development Workflow for Entertainment

#### Phase 1: Theme Research (30 minutes)

- Explore current pop culture and viral trends
- Identify entertaining topics and memes
- Brainstorm humorous angles and perspectives

#### Phase 2: Category Creation (45 minutes)

- Design 6 fun category names
- Ensure categories are distinct but thematically related
- Test category names for memorability and appeal

#### Phase 3: Question Writing (2 hours)

- Create 30 entertaining questions (5 per category)
- Focus on shareability and engagement
- Balance humor styles and difficulty levels
- Iterate on questions that don't land well

#### Phase 4: Quality Review (30 minutes)

- Test questions for entertainment value
- Verify Jeopardy format compliance
- Check for appropriate tone and appeal
- Ensure broad accessibility

### Common Entertainment Pitfalls

#### Forced Humor

❌ "Why did the programmer quit his job? Because he didn't get arrays!"
✅ "This programming error caused a major bank's website to display random movie quotes instead of account balances"

#### Outdated References

❌ "This MySpace feature revolutionized social networking"
✅ "This TikTok dance challenge went viral when a celebrity politician attempted it"

#### Too Niche

❌ "This obscure indie game developer created a cult following"
✅ "This mobile game became so addictive that companies banned it during work hours"

#### Offensive Content

❌ References that could alienate or offend players
✅ Inclusive humor that brings people together

### Entertainment Round Checklist

- [ ] **Theme Selection**: Clear, engaging entertainment theme
- [ ] **Category Appeal**: Fun, memorable category names
- [ ] **Question Entertainment**: Each question maximizes fun and shareability
- [ ] **Difficulty Balance**: Progressive scaling appropriate for entertainment content
- [ ] **Cultural Sensitivity**: Appropriate for general audiences
- [ ] **Jeopardy Compliance**: Proper format maintained despite entertainment focus
- [ ] **Testing**: Questions tested for engagement and memorability

## Validation

Before submitting, validate your content:

```bash
# Install validation dependencies
npm install

# Run validation on your round
npm run validate rounds/your_round_id
```

The validation will check:

- ✅ JSON syntax correctness
- ✅ Required fields presence
- ✅ Question/answer format compliance
- ✅ Image file references
- ✅ Round structure consistency

## Submission Process

1. **Create a new branch** for your contribution
2. **Add your round** following the structure above
3. **Update manifest.json** to include your round metadata
4. **Run validation** and fix any issues
5. **Test locally** if possible
6. **Commit your changes** with a clear message
7. **Submit a Pull Request** with:
   - Clear description of your round
   - Difficulty level and target audience
   - Any special instructions

## Best Practices

### Content Quality

- **Test your questions**: Try answering them yourself
- **Balance difficulty**: Mix easy, medium, and hard questions
- **Be inclusive**: Avoid culturally specific references
- **Keep it fun**: Include some lighter questions among technical ones

### Technical Best Practices

- **Use consistent formatting**: Follow the examples provided
- **Validate before submitting**: Use the validation tools
- **Keep file sizes reasonable**: Optimize images if included
- **Use descriptive names**: Clear round and category names

### Community Guidelines

- **Be respectful**: Content should be appropriate for all ages
- **Give credit**: Acknowledge sources if using existing questions
- **Be collaborative**: Help review other contributors' submissions
- **Stay on topic**: Focus on technology, programming, and security themes

## Need Help?

- Check existing rounds for examples
- Look at the validation error messages
- Ask questions in your Pull Request
- Join our community discussions

Thank you for contributing to Hacker Jeopardy! 🎉