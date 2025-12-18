#!/usr/bin/env python3
"""
Comprehensive validation script for Hacker Jeopardy rounds
Checks JSON validity, image references, and data consistency
"""

import json
import os
from pathlib import Path

def validate_json_file(filepath):
    """Validate that a JSON file is well-formed"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        return True, None
    except json.JSONDecodeError as e:
        return False, str(e)
    except Exception as e:
        return False, f"File read error: {e}"

def validate_round_structure(round_data, round_name):
    """Validate round.json structure"""
    issues = []

    if not isinstance(round_data, dict):
        issues.append(f"{round_name}/round.json: Root must be an object")
        return issues

    # Check required fields
    required_fields = ['name', 'categories']
    for field in required_fields:
        if field not in round_data:
            issues.append(f"{round_name}/round.json: Missing required field '{field}'")

    # Validate categories
    if 'categories' in round_data:
        categories = round_data['categories']
        if not isinstance(categories, list):
            issues.append(f"{round_name}/round.json: 'categories' must be an array")
        elif len(categories) == 0:
            issues.append(f"{round_name}/round.json: 'categories' array is empty")
        else:
            for cat in categories:
                if not isinstance(cat, str):
                    issues.append(f"{round_name}/round.json: Category '{cat}' must be a string")

    return issues

def validate_category_structure(cat_data, round_name, cat_name):
    """Validate cat.json structure"""
    issues = []

    if not isinstance(cat_data, dict):
        issues.append(f"{round_name}/{cat_name}/cat.json: Root must be an object")
        return issues

    # Check required fields
    required_fields = ['name', 'questions']
    for field in required_fields:
        if field not in cat_data:
            issues.append(f"{round_name}/{cat_name}/cat.json: Missing required field '{field}'")

    # Validate questions
    if 'questions' in cat_data:
        questions = cat_data['questions']
        if not isinstance(questions, list):
            issues.append(f"{round_name}/{cat_name}/cat.json: 'questions' must be an array")
        elif len(questions) == 0:
            issues.append(f"{round_name}/{cat_name}/cat.json: 'questions' array is empty")
        else:
            for i, question in enumerate(questions):
                question_issues = validate_question_structure(question, round_name, cat_name, i)
                issues.extend(question_issues)

    return issues

def validate_question_structure(question, round_name, cat_name, question_index):
    """Validate individual question structure"""
    issues = []

    if not isinstance(question, dict):
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} must be an object")
        return issues

    # Check for question field
    if 'question' not in question:
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} missing 'question' field")
    elif not isinstance(question['question'], str):
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} 'question' must be a string")

    # Check for answer or image (one must be present)
    has_answer = 'answer' in question
    has_image = 'image' in question

    if not has_answer and not has_image:
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} must have either 'answer' or 'image'")
    elif has_answer and has_image:
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} cannot have both 'answer' and 'image'")

    if has_answer and not isinstance(question['answer'], str):
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} 'answer' must be a string")

    if has_image and not isinstance(question['image'], str):
        issues.append(f"{round_name}/{cat_name}/cat.json: Question {question_index + 1} 'image' must be a string")

    return issues

def check_round_consistency():
    """Comprehensive validation of all round files"""
    assets_path = Path("src/assets")
    issues = []

    print("🔍 Performing comprehensive round validation...\n")

    # Check round directories in assets
    round_dirs = [d for d in assets_path.iterdir() if d.is_dir() and not d.name.startswith('.')]

    for round_dir in round_dirs:
        round_name = round_dir.name
        print(f"📂 Validating round: {round_name}")

        # Check for round.json
        round_json = round_dir / "round.json"
        if not round_json.exists():
            # Skip archive directories that don't have proper structure
            if round_name.lower() in ['archiv']:
                print(f"  ⏭️  Skipping archive directory: {round_name}")
                continue
            issues.append(f"Missing round.json in {round_name}")
            continue

        # Validate round.json
        valid, error = validate_json_file(round_json)
        if not valid:
            issues.append(f"Invalid JSON in {round_name}/round.json: {error}")
            continue

        with open(round_json, 'r', encoding='utf-8') as f:
            round_data = json.load(f)

        # Validate round structure
        round_issues = validate_round_structure(round_data, round_name)
        issues.extend(round_issues)

        if round_issues:
            continue  # Skip category validation if round.json is invalid

        categories = round_data.get('categories', [])
        print(f"  📁 {len(categories)} categories: {', '.join(categories[:3])}{'...' if len(categories) > 3 else ''}")

        # Check each category
        for category in categories:
            cat_dir = round_dir / category
            cat_json = cat_dir / "cat.json"

            if not cat_dir.exists():
                issues.append(f"Missing category directory: {round_name}/{category}")
                continue

            if not cat_json.exists():
                issues.append(f"Missing cat.json: {round_name}/{category}/cat.json")
                continue

            # Validate cat.json
            valid, error = validate_json_file(cat_json)
            if not valid:
                issues.append(f"Invalid JSON in {round_name}/{category}/cat.json: {error}")
                continue

            with open(cat_json, 'r', encoding='utf-8') as f:
                cat_data = json.load(f)

            # Validate category structure
            cat_issues = validate_category_structure(cat_data, round_name, category)
            issues.extend(cat_issues)

            questions = cat_data.get('questions', [])
            print(f"    📄 {category}: {len(questions)} questions")

            # Check each question for image references
            for i, question in enumerate(questions):
                if 'image' in question:
                    image_path = cat_dir / question['image']
                    if not image_path.exists():
                        issues.append(f"Missing image: {round_name}/{category}/{question['image']} (question {i+1})")

    # Check JSON files in cats/hackerjeopardy
    print(f"\n🔍 Validating jeopardy prompt files...")
    cats_path = Path("cats/hackerjeopardy")
    json_files = list(cats_path.glob("jeopardy_prompts_*.json"))

    for json_file in json_files:
        valid, error = validate_json_file(json_file)
        if not valid:
            issues.append(f"Invalid JSON in {json_file.name}: {error}")
            continue

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            questions = data.get('questions', [])
            name = data.get('name', json_file.stem.replace('jeopardy_prompts_', ''))

            # Check for images in these files (they shouldn't have any)
            has_images = any('image' in q for q in questions)
            if has_images:
                issues.append(f"Unexpected images found in {json_file.name}")

            # Check question count (these should have exactly 5)
            if len(questions) != 5:
                issues.append(f"{json_file.name}: Expected 5 questions, found {len(questions)}")

            # Validate question structure
            for i, question in enumerate(questions):
                if not isinstance(question, dict):
                    issues.append(f"{json_file.name}: Question {i+1} must be an object")
                    continue

                if 'question' not in question or 'answer' not in question:
                    issues.append(f"{json_file.name}: Question {i+1} missing required fields")

                if 'image' in question:
                    issues.append(f"{json_file.name}: Question {i+1} should not have image field")

            print(f"  ✅ {name}: {len(questions)} questions")

        except Exception as e:
            issues.append(f"Error processing {json_file.name}: {e}")

    return issues

if __name__ == "__main__":
    print("🔍 Starting comprehensive Hacker Jeopardy round validation...\n")

    issues = check_round_consistency()

    print(f"\n📊 Validation Results:")
    print(f"Total rounds checked: {len([d for d in Path('src/assets').iterdir() if d.is_dir() and not d.name.startswith('.')])}")
    print(f"Total prompt files checked: {len(list(Path('cats/hackerjeopardy').glob('jeopardy_prompts_*.json')))}")

    if issues:
        print(f"\n❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  • {issue}")
        print(f"\n⚠️  Please fix the above issues before deployment.")
    else:
        print("\n✅ All validations passed! All rounds are consistent, JSON is valid, and all referenced images exist.")

    print(f"\n📈 Summary: {len(issues)} issues detected")