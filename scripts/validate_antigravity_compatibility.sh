#!/bin/bash

# Antigravity Compatibility Validation Script
# Checks all skills and workflows for Antigravity compatibility

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$PROJECT_ROOT/.agent/skills"
WORKFLOWS_DIR="$PROJECT_ROOT/.agent/workflows"

echo "🔍 Validating Antigravity Compatibility..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_skills=0
valid_skills=0
total_workflows=0
valid_workflows=0
issues_found=0

# Check Skills
echo "📋 Checking Skills..."
echo "===================="

for skill_dir in "$SKILLS_DIR"/*; do
    if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        skill_file="$skill_dir/SKILL.md"
        
        total_skills=$((total_skills + 1))
        
        if [ ! -f "$skill_file" ]; then
            echo -e "${RED}❌ $skill_name: Missing SKILL.md${NC}"
            issues_found=$((issues_found + 1))
            continue
        fi
        
        # Check for YAML frontmatter
        if ! head -n 1 "$skill_file" | grep -q "^---$"; then
            echo -e "${RED}❌ $skill_name: Missing YAML frontmatter${NC}"
            issues_found=$((issues_found + 1))
            continue
        fi
        
        # Check for description field
        if ! head -n 10 "$skill_file" | grep -q "^description:"; then
            echo -e "${YELLOW}⚠️  $skill_name: Missing description field${NC}"
            issues_found=$((issues_found + 1))
            continue
        fi
        
        # Check for Claude Code specific references
        if grep -q "oh-my-claudecode\|Claude Code\|~/.claude/" "$skill_file"; then
            echo -e "${YELLOW}⚠️  $skill_name: Contains Claude Code references${NC}"
            issues_found=$((issues_found + 1))
        fi
        
        # Check for hooks references (not supported in Antigravity)
        if grep -q "hooks\.json\|PreToolUse\|PostToolUse" "$skill_file"; then
            echo -e "${YELLOW}⚠️  $skill_name: Contains hooks references (not supported)${NC}"
            issues_found=$((issues_found + 1))
        fi
        
        valid_skills=$((valid_skills + 1))
        echo -e "${GREEN}✅ $skill_name${NC}"
    fi
done

echo ""
echo "📋 Checking Workflows..."
echo "========================"

for workflow_file in "$WORKFLOWS_DIR"/*.md; do
    if [ -f "$workflow_file" ]; then
        workflow_name=$(basename "$workflow_file" .md)
        
        total_workflows=$((total_workflows + 1))
        
        # Check for YAML frontmatter
        if ! head -n 1 "$workflow_file" | grep -q "^---$"; then
            echo -e "${RED}❌ $workflow_name: Missing YAML frontmatter${NC}"
            issues_found=$((issues_found + 1))
            continue
        fi
        
        # Check for description field
        if ! head -n 10 "$workflow_file" | grep -q "^description:"; then
            echo -e "${YELLOW}⚠️  $workflow_name: Missing description field${NC}"
            issues_found=$((issues_found + 1))
            continue
        fi
        
        # Check for Claude Code specific references
        if grep -q "oh-my-claudecode\|Claude Code\|~/.claude/" "$workflow_file"; then
            echo -e "${YELLOW}⚠️  $workflow_name: Contains Claude Code references${NC}"
            issues_found=$((issues_found + 1))
        fi
        
        valid_workflows=$((valid_workflows + 1))
        echo -e "${GREEN}✅ $workflow_name${NC}"
    fi
done

echo ""
echo "📊 Summary"
echo "=========="
echo "Skills:    $valid_skills/$total_skills valid"
echo "Workflows: $valid_workflows/$total_workflows valid"
echo "Issues:    $issues_found found"
echo ""

if [ $issues_found -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for Antigravity.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $issues_found compatibility issues.${NC}"
    echo "Run './scripts/fix_antigravity_compatibility.sh' to auto-fix."
    exit 1
fi
