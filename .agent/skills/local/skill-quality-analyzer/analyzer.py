#!/usr/bin/env python3
import os
import sys
import yaml
import json
import re
import argparse
from pathlib import Path

def load_skill_yaml(skill_path):
    """Loads SKILL.md and parses frontmatter."""
    skill_md_path = skill_path / "SKILL.md"
    if not skill_md_path.exists():
        return None, None
    
    try:
        content = skill_md_path.read_text(encoding="utf-8")
        parts = content.split("---")
        if len(parts) < 3:
            return None, content # Malformed frontmatter
        
        yaml_content = parts[1]
        markdown_content = "---".join(parts[2:])
        data = yaml.safe_load(yaml_content)
        return data, markdown_content
    except Exception as e:
        print(f"Error parsing SKILL.md: {e}")
        return None, None

def analyze_clarity(frontmatter, markdown):
    """Analyzes clarity dimension."""
    score = 100
    issues = []
    
    if not frontmatter.get("description"):
        score -= 40
        issues.append("Missing description in frontmatter")
    else:
        desc_len = len(frontmatter["description"])
        if desc_len < 20:
            score -= 20
            issues.append("Description is too short (< 20 chars)")
        if re.search(r"\b(helps|various|many|stuff|things)\b", frontmatter["description"], re.IGNORECASE):
            score -= 10
            issues.append("Description uses vague words")

    return max(0, score), issues

def analyze_structure(skill_path, frontmatter, markdown):
    """Analyzes structure dimension."""
    score = 100
    issues = []
    
    if not frontmatter:
        return 0, ["Invalid or missing YAML frontmatter"]
        
    if "name" not in frontmatter:
        score -= 20
        issues.append("Missing 'name' in frontmatter")
    elif not re.match(r"^[a-z0-9-]+$", frontmatter["name"]):
        score -= 10
        issues.append("Skill name should be kebab-case")

    required_sections = ["Capabilities", "Input Requirements", "How to Use"] # approximate matches
    for section in required_sections:
        if not re.search(f"^#+.*{section}", markdown, re.MULTILINE | re.IGNORECASE):
            score -= 15
            issues.append(f"Missing section: {section}")

    return max(0, score), issues

def analyze_examples(skill_path, markdown):
    """Analyzes examples dimension."""
    score = 100
    issues = []
    
    # Check for examples in markdown
    code_blocks = re.findall(r"```.*?```", markdown, re.DOTALL)
    if len(code_blocks) < 2:
        score -= 20
        issues.append("Few or no usage examples found in SKILL.md")
        
    # Check for sample files
    if not (skill_path / "sample_input.json").exists():
        score -= 15
        issues.append("Missing sample_input.json")
    if not (skill_path / "expected_output.json").exists():
        score -= 15
        issues.append("Missing expected_output.json")
        
    return max(0, score), issues

def analyze_triggers(frontmatter, markdown):
    """Analyzes trigger detection dimension."""
    score = 100
    issues = []
    
    usage_section = re.search(r"^#+.*(How to Use|When to Use)", markdown, re.MULTILINE | re.IGNORECASE)
    if not usage_section:
        score -= 20
        issues.append("No clear 'How to Use' or 'When to Use' section")
        
    if frontmatter and "description" in frontmatter:
        desc = frontmatter["description"].lower()
        triggers = ["when", "use this", "trigger", "ask"]
        if not any(t in desc for t in triggers):
             # Less strict check, just looking for specificity
             pass 
    
    return max(0, score), issues

def analyze_best_practices(skill_path, frontmatter):
    """Analyzes best practices dimension."""
    score = 100
    issues = []
    
    if not (skill_path / "README.md").exists():
        score -= 10
        issues.append("Missing README.md")
    if not (skill_path / "HOW_TO_USE.md").exists():
        score -= 10
        issues.append("Missing HOW_TO_USE.md")
        
    # Check for garbage files
    garbage = list(skill_path.glob("**/*.pyc")) + list(skill_path.glob("**/.DS_Store"))
    if garbage:
        score -= 5
        issues.append(f"Found {len(garbage)} garbage files (.pyc, .DS_Store)")
        
    return max(0, score), issues

def analyze_maintainability(skill_path, frontmatter):
    """Analyzes maintainability dimension."""
    score = 100
    issues = []
    
    if frontmatter and "version" not in frontmatter:
        score -= 10
        issues.append("Missing version in frontmatter")
        
    file_count = len(list(skill_path.glob("**/*")))
    if file_count > 20:
        score -= 10
        issues.append("High file count (>20), consider cleaning up")
        
    return max(0, score), issues

def main():
    parser = argparse.ArgumentParser(description="Skill Quality Analyzer")
    parser.add_argument("--skill-path", required=True, help="Path to the skill directory")
    args = parser.parse_args()
    
    skill_path = Path(args.skill_path).expanduser().resolve()
    
    if not skill_path.exists():
        print(f"Error: Path {skill_path} does not exist")
        sys.exit(1)
        
    frontmatter, markdown = load_skill_yaml(skill_path)
    
    if not frontmatter:
        print(json.dumps({
            "overall_score": 0,
            "issues": ["Could not parse SKILL.md or invalid YAML frontmatter"],
            "dimensions": {}
        }, indent=2))
        sys.exit(0)

    # Calculate scores
    scores = {}
    total_score = 0
    total_weight = 0
    all_issues = []
    
    dimensions = [
        ("clarity", lambda s, f, m: analyze_clarity(f, m), 20),
        ("structure", lambda s, f, m: analyze_structure(s, f, m), 20),
        ("examples", lambda s, f, m: analyze_examples(s, m), 15),
        ("trigger_detection", lambda s, f, m: analyze_triggers(f, m), 15),
        ("best_practices", lambda s, f, m: analyze_best_practices(s, f), 15),
        ("maintainability", lambda s, f, m: analyze_maintainability(s, f), 15)
    ]
    
    results = {}
    
    for name, func, weight in dimensions:
        score, issues = func(skill_path, frontmatter, markdown)
            
        results[name] = {
            "score": score,
            "weight": weight,
            "issues": issues
        }
        total_score += score * (weight / 100.0)
        total_weight += weight
        all_issues.extend(issues)

    output = {
        "skill_name": frontmatter.get("name", "unknown"),
        "overall_score": int(total_score),
        "dimensions": results,
        "all_issues": all_issues,
        "recommendations": [f"Fix: {issue}" for issue in all_issues] # Simple recommendation generation
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
