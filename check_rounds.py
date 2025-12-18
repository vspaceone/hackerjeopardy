#!/usr/bin/env python3
"""
Script to check Hacker Jeopardy rounds for inconsistencies and missing images
"""

import json
import os
from pathlib import Path

def check_round_consistency():
    """Check all round files for consistency and missing images"""
    assets_path = Path("src/assets")
    cats_path = Path("cats/hackerjeopardy")

    issues = []

    # Check round directories in assets
    for round_dir in assets_path.iterdir():
        if round_dir.is_dir() and not round_dir.name.startswith('.'):
            print(f"\n🔍 Checking round: {round_dir.name}")

            # Check for round.json
            round_json = round_dir / "round.json"
            if not round_json.exists():
                issues.append(f"Missing round.json in {round_dir.name}")
                continue

            try:
                with open(round_json, 'r', encoding='utf-8') as f:
                    round_data = json.load(f)

                categories = round_data.get('categories', [])
                print(f"  📁 Categories: {', '.join(categories)}")

                # Check each category
                for category in categories:
                    cat_dir = round_dir / category
                    cat_json = cat_dir / "cat.json"

                    if not cat_dir.exists():
                        issues.append(f"Missing category directory: {round_dir.name}/{category}")
                        continue

                    if not cat_json.exists():
                        issues.append(f"Missing cat.json: {round_dir.name}/{category}/cat.json")
                        continue

                    try:
                        with open(cat_json, 'r', encoding='utf-8') as f:
                            cat_data = json.load(f)

                        questions = cat_data.get('questions', [])
                        print(f"    📄 {category}: {len(questions)} questions")

                        # Check each question for image references
                        for i, question in enumerate(questions):
                            if 'image' in question:
                                image_path = cat_dir / question['image']
                                if not image_path.exists():
                                    issues.append(f"Missing image: {round_dir.name}/{category}/{question['image']} (question {i+1})")

                        # Check for extra fields that might indicate inconsistency
                        for question in questions:
                            if 'image' in question and 'answer' in question:
                                issues.append(f"Question has both image and answer: {round_dir.name}/{category} - this is not supported")

                    except json.JSONDecodeError as e:
                        issues.append(f"Invalid JSON in {round_dir.name}/{category}/cat.json: {e}")

            except json.JSONDecodeError as e:
                issues.append(f"Invalid JSON in {round_dir.name}/round.json: {e}")

    # Check JSON files in cats/hackerjeopardy
    print(f"\n🔍 Checking jeopardy prompt files...")
    json_files = list(cats_path.glob("jeopardy_prompts_*.json"))

    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            questions = data.get('questions', [])
            name = data.get('name', json_file.stem)

            # Check for images in these files (though they shouldn't have any)
            has_images = any('image' in q for q in questions)
            if has_images:
                issues.append(f"Unexpected images found in {json_file.name}")

            # Check question count
            if len(questions) != 5:
                issues.append(f"{json_file.name}: Expected 5 questions, found {len(questions)}")

            print(f"  ✅ {name}: {len(questions)} questions")

        except json.JSONDecodeError as e:
            issues.append(f"Invalid JSON in {json_file.name}: {e}")

    return issues

if __name__ == "__main__":
    print("🔍 Checking Hacker Jeopardy rounds for inconsistencies and missing images...\n")

    issues = check_round_consistency()

    if issues:
        print(f"\n❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  • {issue}")
    else:
        print("\n✅ No issues found! All rounds are consistent and all referenced images exist.")

    print(f"\n📊 Summary: {len(issues)} issues detected")