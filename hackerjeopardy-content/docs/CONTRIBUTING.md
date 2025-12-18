# Contributing to Hacker Jeopardy Content

Thank you for contributing to Hacker Jeopardy! This guide will help you add new content to the game.

## Getting Started

1. **Fork this repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `npm install`
4. **Create a new branch** for your changes

## Creating Content

### Round Structure

Each round should be placed in its own directory under `rounds/[roundId]/`:

```
rounds/
└── my_awesome_round/
    ├── round.json
    ├── category1/
    │   └── cat.json
    ├── category2/
    │   └── cat.json
    └── images/          (optional)
        ├── image1.jpg
        └── image2.png
```

### Round Metadata (round.json)

```json
{
  "name": "My Awesome Round",
  "categories": ["category1", "category2", "category3"],
  "difficulty": "easy",
  "author": "Your Name",
  "licence": "MIT",
  "date": "2025-12-18",
  "email": "you@example.com",
  "comment": "Optional description of your round"
}
```

### Category Files (cat.json)

```json
{
  "name": "Category Name",
  "questions": [
    {
      "question": "What is the answer to this question?",
      "answer": "The Answer",
      "value": 100,
      "available": true,
      "cat": "category_name"
    },
    {
      "question": "Another question?",
      "answer": "Another answer",
      "value": 200,
      "available": true,
      "cat": "category_name",
      "image": "optional_image.jpg"
    }
  ]
}
```

## Question Guidelines

### Content Rules
- **Questions should be Jeopardy-style**: Answer comes first, question follows
- **Answers should be accurate** and verifiable
- **Keep questions appropriate** for a general audience
- **Include variety** in difficulty within categories
- **Use clear, unambiguous language**

### Technical Requirements
- **Question values**: 100, 200, 300, 400, 500 (standard Jeopardy format)
- **Categories**: 3-6 categories per round recommended
- **Questions per category**: 5 questions (one for each value)
- **JSON format**: Must be valid JSON with proper escaping

## Validation

Before submitting, always run validation:

```bash
npm run validate
```

This will check:
- ✅ Manifest structure and required fields
- ✅ Round metadata completeness
- ✅ Category file existence and format
- ✅ Question structure and required fields

## Submitting Your Content

1. **Run validation**: `npm run validate`
2. **Test your content**: Make sure it works in the game
3. **Update manifest.json**: Add your round to the manifest
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add [round name] round"
   ```
5. **Push to your fork** and create a pull request

## Content Categories

Popular categories include:
- **Technology**: Programming languages, frameworks, tools
- **Security**: Hacking, cryptography, vulnerabilities
- **History**: Tech history, famous hackers, events
- **Science**: Computer science, mathematics, physics
- **Culture**: Internet culture, memes, pop culture
- **Geography**: Tech hubs, countries, cities

## Images and Media

- Place images in category subdirectories
- Reference images in questions using relative paths
- Supported formats: JPG, PNG, GIF
- Keep file sizes reasonable (< 500KB per image)

## License

By contributing, you agree to license your content under the MIT License.

## Questions?

If you have questions or need help, please:
- Check existing rounds for examples
- Open an issue on GitHub
- Join our community discussions

Happy contributing! 🎉