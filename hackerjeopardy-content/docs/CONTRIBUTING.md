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
     │   ├── cat.json
     │   ├── diagram1.jpg
     │   └── photo1.png
     └── category2/
         ├── cat.json
         └── image2.gif
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
       "question": "This famous tower is located in Paris",
       "answer": "What is the Eiffel Tower?",
       "value": 100,
       "available": true,
       "cat": "category_name"
     },
      {
        "question": "This programming language was created by Guido van Rossum",
        "answer": "What is Python?",
        "value": 200,
        "available": true,
        "cat": "category_name",
        "image": "python-logo.jpg"
      }
  ]
}
```

 ## Question Guidelines

 ### Jeopardy Format
 In Jeopardy-style questions:
 - The **"question" field** contains the **clue** that contestants see
 - The **"answer" field** contains the **correct response** contestants should give
 - Example: Contestants see "This famous tower is in Paris" and respond "What is the Eiffel Tower?"

 ### Content Rules
 - **Clues should be accurate** and verifiable
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

Images can enhance questions and make them more engaging. Follow these guidelines for proper image handling.

### Directory Structure

Images must be placed in the correct directory structure for the game to find them:

```
rounds/
└── your_round_id/
    ├── round.json
    ├── category_name/
    │   ├── cat.json
    │   ├── image1.jpg
    │   ├── image2.png
    │   └── diagram.gif
    └── another_category/
        ├── cat.json
        └── photo.jpeg
```

**Important:** Images go **inside** the category directory, **not** in a separate `images/` folder.

### File Naming and Formats

- **Supported formats**: JPG, PNG, GIF, WebP
- **File naming**: Use descriptive names with hyphens or underscores (no spaces)
- **File size limit**: Keep images under 500KB for optimal loading
- **Optimization**: Compress images and use appropriate dimensions

### Referencing Images in Questions

In your `cat.json` files, reference images using **only the filename** (no paths):

```json
{
  "name": "Category Name",
  "questions": [
    {
      "question": "What is this famous landmark?",
      "answer": "The Eiffel Tower",
      "value": 200,
      "available": true,
      "cat": "landmarks",
      "image": "eiffel-tower.jpg"
    },
    {
      "question": "What does this diagram show?",
      "answer": "A binary search tree",
      "value": 400,
      "available": true,
      "cat": "algorithms",
      "image": "binary-search-tree.png"
    }
  ]
}
```

**Key points:**
- ✅ **Use only filename**: `"image": "filename.jpg"`
- ❌ **Don't use paths**: `"image": "images/filename.jpg"`
- ❌ **Don't use full URLs**: `"image": "https://example.com/image.jpg"`

### Image Requirements

- **Dimensions**: Reasonable sizes (under 1000px width/height recommended)
- **Aspect ratio**: Works well with question display (landscape preferred)
- **Quality**: Clear and readable at question display size
- **Relevance**: Images should directly relate to the question content

### Testing Images

After adding images:

1. **Commit and push** your changes to GitHub
2. **Enable GitHub Pages** for your fork (if testing)
3. **Test in the game** to ensure images load correctly
4. **Check browser console** for any loading errors

### Troubleshooting

**Images not showing?**
- Verify files are committed and pushed to GitHub
- Check that GitHub Pages is enabled for the repository
- Ensure filenames match exactly (case-sensitive)
- Check browser network tab for 404 errors

**Path errors?**
- Images must be in `rounds/{roundId}/{categoryName}/`
- Question `image` field should contain only filename
- Category names with spaces/special chars are URL-encoded automatically

## License

By contributing, you agree to license your content under the MIT License.

## Questions?

If you have questions or need help, please:
- Check existing rounds for examples
- Open an issue on GitHub
- Join our community discussions

Happy contributing! 🎉