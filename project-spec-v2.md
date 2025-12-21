## 1. Project Title

**SpecifyThat** (Planning and Prompt Engine)

------------------------------------------------------------------------

## 2. One-Paragraph Summary

A planning and prompt engine that transforms raw ideas into build-ready specs in under 60 seconds. User describes their project in one input field, hits "Generate", and watches as the engine fills in all 13 strategic questions with intelligent, contextual answers. User reviews all answers on one page, clicks edit on any they want to refine, then generates a copy-ready project spec optimized for AI builders (Cursor, Claude, ChatGPT, Bolt, v0). Zero backend—pure client-side with pre-scripted mock responses for demo purposes.

------------------------------------------------------------------------

## 3. Primary Goal

Build a stunning client-side demo that showcases how a planning and prompt engine can turn one input into a complete, structured project specification ready to paste into AI coding tools.

------------------------------------------------------------------------

## 4. Constraints

- **100% client-side** - No backend, no API calls, no server
- **Mock AI responses** - Pre-scripted, context-aware answers
- **Static deployment** - Can be opened as HTML file in browser
- **Build time** - 3-4 hours max
- **Mobile responsive** - Works on phones

------------------------------------------------------------------------

## 5. Core Flow

### Step 1: Landing Page
- Hero section explaining the planning and prompt engine concept
- "Start New Spec" button
- Clean, modern design with gradient accents

### Step 2: Initial Input
- Single question: **"Describe your project. What does it do and who is it for?"**
- Large textarea with file upload option (.txt, .md up to 10MB)
- "Generate My Spec" button

### Step 3: Engine Processing (Loading State)
- Progress animation: "Analyzing your project..." → "Answering strategic questions..." → "Building spec..."
- Takes 3-5 seconds with realistic loading feel
- Mock engine generates answers for all 13 questions at once using project description as context

### Step 4: Review All Answers
- Display all 13 questions with engine-generated answers in accordion/card layout
- Each card shows:
  - Question number and section name
  - Generated answer (read-only initially)
  - "Edit" button (opens inline textarea)
- Progress indicator: "13 of 13 questions answered ✓"
- Big "Generate Spec" button at bottom

### Step 5: Edit Flow (Optional)
- User clicks "Edit" on any question
- Answer becomes editable textarea
- "Save" and "Cancel" buttons appear
- After saving, answer updates and shows "✓ Edited" badge

### Step 6: Final Spec
- Markdown-formatted spec with all 10 sections filled in
- Copy button with success animation
- Download as .md button
- End message: "📋 **Next Step**: Paste this into your favorite AI creator (Cursor, VS Code Copilot, Claude, ChatGPT, Bolt, v0, Emergent) and start building!"
- "Start Over" button

------------------------------------------------------------------------

## 6. The 13 Strategic Questions

User never sees these—the engine fills them all automatically:

1. Project name
2. One-paragraph summary (user input used here)
3. Primary goal
4. Hard constraints
5. Deployment requirements
6. Core features (must-haves)
7. Non-goals (what NOT to build)
8. Data entities
9. Entity relationships
10. Main user flow
11. APIs/services needed
12. Build sequence
13. Success criteria

------------------------------------------------------------------------

## 7. Mock Engine Logic

Create ONE smart function: `generateAllAnswers(projectDescription)`

**Input**: User's project description  
**Output**: Object with 13 contextual answers

**Logic**:
- Parse description for keywords: e-commerce, social, productivity, SaaS, mobile, etc.
- Generate contextual answers based on project type
- Use templates with intelligent substitution
- Make it feel like real strategic thinking (not generic)

**Example**:
```javascript
// If description mentions "task management for teams"
{
  1: "TaskFlow Pro",
  3: "Enable remote teams to coordinate work and track progress without meeting fatigue",
  6: "- Create/assign tasks with due dates\n- Real-time status updates\n- Team dashboard view\n- Async daily standups\n- Browser-based persistence",
  7: "- Video calling\n- File storage\n- Time tracking\n- Gantt charts\n- Mobile apps (web-first)",
  // ... etc
}
```

------------------------------------------------------------------------

## 8. Data Model (Minimal)

```typescript
interface Session {
  projectDescription: string;
  answers: { [questionId: number]: string };
  editedQuestions: number[]; // Track which were manually edited
}
```

Store in React state or sessionStorage. That's it.

------------------------------------------------------------------------

## 9. Technical Notes

**Key Behaviors**:
- Use `setTimeout()` for 3-5 second mock processing delay (feels realistic)
- File upload uses FileReader API (reads locally, doesn't upload)
- Copy uses `navigator.clipboard.writeText()`
- Download creates blob: `new Blob([spec], { type: 'text/markdown' })`
- Make mock answers feel intelligent—use if/else on keywords from description

**What Makes This a "Prompt Engine"**:
- The final spec is optimized for pasting into AI coding tools
- Spec format follows proven structure (title, summary, goals, constraints, requirements, data model, interfaces, execution order, success criteria)
- Language is concrete and actionable—AI builders can execute directly from it
- Non-goals section prevents scope creep
- "One day buildable" constraint keeps scope tight

------------------------------------------------------------------------

## Final Note

This planning and prompt engine demo shows the future of spec writing: describe what you want once, let intelligent automation handle the strategic breakdown, review and refine, then feed it straight to AI builders. The goal is to compress hours of planning into minutes, with output that's immediately useful for Claude, ChatGPT, Cursor, Bolt, v0, or Emergent.