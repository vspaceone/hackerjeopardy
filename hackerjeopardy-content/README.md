# Hacker Jeopardy Content Repository

This repository contains content for the Hacker Jeopardy game - question sets, rounds, and media assets.

## Repository Structure

```
hackerjeopardy-content/
├── rounds/                 # Game rounds
│   └── [roundId]/
│       ├── round.json      # Round metadata
│       └── [category]/
│           └── cat.json    # Category questions
├── manifest.json           # Content registry
├── package.json           # Validation tooling
├── scripts/               # Build/validation scripts
└── docs/                  # Documentation
```

## Round Format

Each round consists of:
- `round.json`: Basic round information (name, categories, metadata)
- Category directories with `cat.json`: Questions for each category

### Round JSON Structure
```json
{
  "name": "Round Name",
  "categories": ["category1", "category2", "category3"],
  "difficulty": "easy|medium|hard|mixed",
  "author": "Author Name",
  "licence": "MIT",
  "date": "YYYY-MM-DD",
  "email": "author@example.com",
  "comment": "Optional description"
}
```

### Category JSON Structure
```json
{
  "name": "Category Name",
  "questions": [
    {
      "question": "Question text?",
      "answer": "Answer text",
      "value": 100,
      "available": true,
      "cat": "category_name"
    }
  ]
}
```

## Development

### Validation
```bash
npm install
npm run validate
```

### Adding New Rounds
1. Create a new directory under `rounds/[roundId]/`
2. Add `round.json` with round metadata
3. Create category subdirectories with `cat.json` files
4. Update `manifest.json` to include the new round
5. Run validation: `npm run validate`

## Deployment

This repository is designed to be served via GitHub Pages. When hosted, the content becomes available to Hacker Jeopardy applications.

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Set source to "main" branch and "/ (root)" directory
3. The manifest will be available at: `https://username.github.io/hackerjeopardy-content/manifest.json`

## Contributing

1. Fork this repository
2. Create a feature branch
3. Add your round content
4. Run validation
5. Submit a pull request

## License

MIT License - see LICENSE file for details.