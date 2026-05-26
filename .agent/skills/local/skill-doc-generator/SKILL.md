---
name: skill-doc-generator
description: Automatically generates comprehensive documentation for Codex skills including README, HOW_TO_USE, and usage examples from SKILL.md
version: 0.1.0
source: fork
checksum: 9e23f2d71a4407051c56e2a4c5078208ea6ca3e0dcb350cfa5fc998cbc86eb61
updated_at: 2026-02-05T17:25:02+08:00
intent: skill-management
layer: meta
---


# Skill Documentation Generator

Automated documentation generation for Codex skills. Creates professional README.md, HOW_TO_USE.md, and example files from your SKILL.md definition.

## Capabilities

- **README Generation**: Creates installation-focused README.md with quick start
- **Usage Guide Creation**: Generates detailed HOW_TO_USE.md with examples
- **Example Extraction**: Pulls usage examples from SKILL.md into standalone files
- **Sample Data Generation**: Creates sample_input/output JSON from skill description
- **Documentation Templates**: Uses Codex best practices for structure
- **Multi-Format Support**: Markdown, JSON, YAML outputs
- **Auto-Update**: Regenerates docs when SKILL.md changes
- **Quality Validation**: Ensures generated docs meet standards

## Input Requirements

**Minimal**:
- SKILL.md file with valid YAML frontmatter
- Basic capabilities and usage sections

**Optimal**:
- Complete SKILL.md with all recommended sections
- Existing usage examples in "How to Use" section
- Python files (if applicable) for code documentation

## Output Files

### 1. README.md
**Purpose**: Quick start and installation guide

**Content**:
- Brief skill description
- Quick install command
- Usage teaser (2-3 examples)
- File listing
- Related skills links

**Length**: ~20-30 lines (scannable)

### 2. HOW_TO_USE.md
**Purpose**: Comprehensive usage guide

**Content**:
- Detailed usage examples (organized by use case)
- Input/output format explanations
- Advanced usage patterns
- Troubleshooting guide
- Integration examples
- Real-world scenarios

**Length**: ~100-200 lines (thorough)

### 3. sample_input.json
**Purpose**: Example input data

**Content**:
- Realistic input example
- All required fields
- Optional fields shown
- Comments explaining structure

### 4. expected_output.json
**Purpose**: Expected output example

**Content**:
- Corresponding output for sample input
- Complete structure shown
- Annotations for clarity

### 5. CHANGELOG.md (Optional)
**Purpose**: Version history

**Content**:
- Version numbers
- Change descriptions
- Breaking changes highlighted
- Migration guides

## How to Use

**Quick Generation**:
```
"Generate documentation for my financial-analyzer skill"
"Create README and HOW_TO_USE for code-review"
"Auto-generate docs for all my skills"
```

**Selective Generation**:
```
"Just create README.md for aws-solution-architect"
"Generate HOW_TO_USE only for prompt-factory"
"Create sample input/output files for skill-tester"
```

**Update Existing Docs**:
```
"Update documentation for financial-analyzer (SKILL.md changed)"
"Regenerate all docs for code-review"
```

**Custom Templates**:
```
"Generate README using minimal template"
"Create comprehensive HOW_TO_USE with troubleshooting"
```

## Documentation Templates

### Template 1: Minimal (Simple Skills)
**README**: 15-20 lines, quick install + 2 examples
**HOW_TO_USE**: 50-75 lines, basic usage patterns
**Use for**: Utility skills, simple tools

### Template 2: Standard (Most Skills)
**README**: 25-35 lines, install + features + 3-4 examples
**HOW_TO_USE**: 100-150 lines, organized sections, real-world examples
**Use for**: Production skills, general purpose

### Template 3: Comprehensive (Complex Skills)
**README**: 40-50 lines, detailed overview, file structure
**HOW_TO_USE**: 200+ lines, advanced patterns, integration guide, troubleshooting
**Use for**: Complex skills, API integrations, multi-feature

## Generation Process

### Step 1: Analyze SKILL.md
```
- Extract YAML frontmatter (name, description)
- Identify sections (Capabilities, Input/Output, How to Use)
- Parse usage examples
- Detect Python files (if present)
```

### Step 2: Select Template
```
- Count capabilities (< 3 = minimal, 3-6 = standard, > 6 = comprehensive)
- Check skill complexity (simple = minimal, medium = standard, complex = comprehensive)
- Consider Python files (present = more detailed docs)
```

### Step 3: Generate Content
```
- README: Skill overview + quick start
- HOW_TO_USE: Detailed guide + examples
- sample_input: Realistic example data
- expected_output: Corresponding output
```

### Step 4: Validate
```
- Check all required sections present
- Verify examples are clear
- Ensure links work
- Validate JSON/YAML syntax
```

### Step 5: Write Files
```
- Create README.md
- Create HOW_TO_USE.md
- Create sample_input.json
- Create expected_output.json
- (Optional) Create CHANGELOG.md
```

## Documentation Best Practices

### README.md Principles
1. **Scannable**: User should understand in 10 seconds
2. **Actionable**: Clear install command
3. **Enticing**: Best 2-3 examples shown
4. **Linked**: References to detailed docs

### HOW_TO_USE.md Principles
1. **Progressive**: Simple examples first, complex later
2. **Organized**: Group by use case or scenario
3. **Real-world**: Actual usage patterns, not theory
4. **Complete**: Cover all major capabilities
5. **Helpful**: Include troubleshooting and tips

### Sample Data Principles
1. **Realistic**: Use actual use case data
2. **Complete**: Show all required fields
3. **Annotated**: Comments explain structure
4. **Valid**: JSON/YAML syntax correct

## Example Generation Session

```
User: "Generate docs for financial-analyzer"

Codex: "Analyzing financial-analyzer skill...

Found:
- 5 capabilities
- 3 input types
- 4 output formats
- 6 usage examples
- 2 Python files

Selecting: Standard template (good fit for medium complexity)

Generating:
✅ README.md (28 lines) - Quick start guide
✅ HOW_TO_USE.md (145 lines) - Comprehensive usage guide
   - 6 usage examples organized by scenario
   - Input/output format details
   - Integration with other skills
   - Troubleshooting section
✅ sample_input.json - P/E ratio calculation example
✅ expected_output.json - Corresponding output with metrics

All files created in ~/.gemini/antigravity/skills/financial-analyzer/

Would you like me to review the generated docs?"
```

## Customization Options

### Content Options
- **Include examples**: true/false (extract from SKILL.md)
- **Include sample data**: true/false (generate JSON examples)
- **Include changelog**: true/false (version history)
- **Include troubleshooting**: true/false (common issues section)

### Style Options
- **Template**: minimal/standard/comprehensive
- **Tone**: technical/friendly/professional
- **Length**: concise/detailed/exhaustive
- **Format**: markdown/text/html

### Advanced Options
- **Extract from code**: Parse Python docstrings for additional content
- **Generate diagrams**: Create workflow/architecture diagrams (ASCII art)
- **API docs**: Generate API reference from code
- **Multilingual**: Create docs in multiple languages

## Integration with Development Workflow

### Initial Skill Creation
```
1. Write SKILL.md with capabilities
2. Run skill-doc-generator
3. Review generated docs
4. Adjust SKILL.md if needed
5. Regenerate docs
```

### Ongoing Maintenance
```
1. Update SKILL.md with new features
2. Run skill-doc-generator (auto-update)
3. Generated docs stay in sync
```

### Pre-Distribution
```
1. Complete SKILL.md
2. Generate all docs
3. Review for quality (use skill-quality-analyzer)
4. Package skill with full documentation
```

## Quality Checks

Generated docs are validated for:
- [ ] README exists and is scannable (< 50 lines)
- [ ] HOW_TO_USE exists and is comprehensive
- [ ] All code blocks have proper syntax
- [ ] Examples are clear and realistic
- [ ] Links are valid (no broken references)
- [ ] JSON/YAML files are valid
- [ ] File structure matches Codex guidelines
- [ ] No spelling/grammar errors

## Common Documentation Issues (Auto-Fixed)

### Issue 1: Vague Examples
**Before**: "Use this skill to analyze data"
**After**: "Calculate P/E ratio: 'Analyze stock with price $100 and EPS $6.45'"

### Issue 2: Missing Installation
**Before**: No install instructions
**After**: "cp -r financial-analyzer ~/.gemini/antigravity/skills/"

### Issue 3: No Input/Output Clarification
**Before**: "Takes data and returns results"
**After**: Shows JSON structure with field explanations

### Issue 4: No Troubleshooting
**Before**: Examples only
**After**: "If skill doesn't trigger, check description keywords"

## Limitations

- **Quality Depends on SKILL.md**: Generated docs only as good as source
- **No Code Analysis**: Doesn't parse complex Python logic (basic docstrings only)
- **Template-Based**: Uses predefined structures (not fully custom)
- **English-Only**: Currently supports English documentation only
- **No Diagrams**: Can't generate complex visual diagrams (ASCII only)

## When NOT to Use This Skill

- **Custom Documentation Needed**: Highly specialized format
- **Code Documentation**: Use language-specific tools (Sphinx, JSDoc)
- **API References**: Use dedicated API doc generators
- **Quick Notes**: Manual README is faster for simple skills

## Success Criteria

Well-generated documentation should:
- ✅ README scannable in < 10 seconds
- ✅ HOW_TO_USE answers "how do I use this?" completely
- ✅ Examples are copy-paste ready
- ✅ Sample data is realistic
- ✅ No user questions left unanswered
- ✅ Passes quality validation
- ✅ Follows Codex best practices

## Related Skills

- Use **skill-quality-analyzer** after generation to validate docs
- Use **skill-debugger** if generated examples don't trigger correctly
- Use **skill-tester** to verify examples work as documented
- Complements **Skill Factory** for initial skill creation
