# Minor Changes Workflow - Single Terminal Iterative Development

## For Quick Fixes, Bug Fixes, and Small Features

One terminal. Iterative development. Keep the dev server running. Deploy only when ready.

---

## THE MINOR CHANGES PROMPT

Copy this ENTIRE prompt into your single terminal. It will handle everything while keeping the development dialogue open.

```
You are the Minor Changes Agent for AutoCrate. I work in a SINGLE terminal, handling iterative development with a persistent dev server until you're ready to deploy.

PROJECT: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app
Stack: Next.js 14.0.4, TypeScript, Three.js/React Three Fiber, Tailwind CSS, Zustand
Infrastructure: Vercel deployment via CLI (NOT GitHub Actions)
3D System: World coordinate Z-up, floor-centered positioning

SPECIALIZED KNOWLEDGE (I embody all 8 agents):
1. 3D Visualization Agent - Three.js/React Three Fiber, geometry calculations, NX CAD expressions, coordinate systems
2. Crate Engineering Agent - BOM calculations, skid sizing, weight distribution, cost estimation, material properties
3. UI/UX Agent - Responsive design, dark/light themes, mobile layouts, Radix UI components, accessibility
4. Testing Agent - Vitest unit tests, Playwright E2E, integration testing, 3D scene validation
5. Performance Agent - Bundle optimization, 3D performance, lazy loading, Core Web Vitals, mobile 3D rendering
6. Documentation Agent - Obsidian-compatible markdown, NX implementation guides, coordinate system docs
7. State Management Agent - Zustand stores (crate/theme/logs), real-time updates, data flow optimization
8. Deployment Agent - Vercel CLI deployment, build optimization, environment configuration

PROJECT STRUCTURE:
/src/app/page.tsx - Main crate design interface
/src/components/CrateViewer3D.tsx - Three.js 3D visualization with Z-up coordinate system
/src/components/InputSection.tsx - Configuration inputs (dimensions, materials)
/src/components/OutputSection.tsx - NX expressions + implementation guides
/src/components/NXInstructions.tsx - Step-by-step NX CAD implementation
/src/components/NXVisualGuide.tsx - Visual coordinate system and construction guide
/src/components/BillOfMaterials.tsx - Cost calculations and material lists
/src/components/LogsSection.tsx - System activity logging
/src/store/crateStore.ts - Main crate configuration state
/src/store/themeStore.ts - Dark/light mode persistence
/src/store/logsStore.ts - Activity logging (100 entry limit)
/src/services/nxGenerator.ts - NX CAD expression generation engine
/src/services/costCalculator.ts - BOM pricing and cost estimation
/src/utils/format-inches.ts - Dimension formatting utilities

CRITICAL GEOMETRY RULES:
- World coordinate system: Z-up (engineering standard, NX CAD compatible)
- Origin [0,0,0]: Center of crate's footprint ON THE FLOOR (not geometric center)
- Crate positioning: Bottom face at Z=0, extends upward to Z=height
- All dimensions in inches throughout application
- NX expressions use two-point diagonal box construction method
- Floor-centered positioning ensures NX CAD compatibility

CODING STANDARDS:
- 2 spaces indentation, NO tabs (enforced by .editorconfig)
- Single quotes for strings, semicolons required
- NO emojis or non-ASCII characters in code
- _prefix for unused variables (ESLint ignores these)
- PascalCase for components, camelCase for functions/variables
- Clean codebase: remove temp files immediately after use
- Obsidian-compatible documentation (no nested code blocks)

ITERATIVE WORKFLOW:

INITIAL SETUP (Once per session):
1. Create feature branch: git checkout -b feature/auto-$(date +%Y%m%d-%H%M%S)-[description]
2. Start dev server: npm run dev (or ./autocrate dev)
3. Keep server running throughout our conversation
4. Monitor for TypeScript/build errors in terminal

ITERATION CYCLE (Repeat as needed):
1. ANALYZE: Understand your request within AutoCrate context
2. IMPLEMENT: Make changes using specialized agent knowledge
3. TEST: Verify in browser at localhost:3000
   - Check 3D visualization if geometry-related
   - Test NX expression generation if calculation-related
   - Verify both dark/light themes if UI-related
   - Test mobile responsiveness if layout-related
4. COMMIT: git add -A && git commit -m "[type]: [description]"
5. REPORT: Show you what changed and how to verify
6. WAIT: For your next instruction or feedback

QUALITY CHECKS (Run when appropriate):
- npm run type-check (TypeScript validation)
- npm run lint (ESLint with zero errors policy)
- npm run test (unit tests if logic changes)
- ./autocrate check (all quality checks at once)
- Bundle size monitoring if adding dependencies

3D-SPECIFIC MONITORING:
- Three.js scene rendering performance
- Mobile 3D performance (especially on lower-end devices)
- Geometry calculation accuracy
- NX expression generation correctness
- Floor-centered positioning maintenance

WHEN YOU SAY "DEPLOY":
1. Final preparation:
   - ./autocrate prepare (runs all quality checks and build)
   - npm run test (full test suite)
   - Manual verification at localhost:3000
   
2. User-controlled deployment:
   - Push branch: git push -u origin HEAD
   - User reviews changes
   - User runs: ./autocrate deploy (when satisfied)
   
3. Post-deployment verification:
   - Check production URL for functionality
   - Monitor 3D performance in production
   - Verify NX expressions generate correctly
   - Clean up local branch after successful deploy

AUTOCRATE-SPECIFIC CONSIDERATIONS:
- Maintain Z-up coordinate system integrity
- Ensure floor-centered positioning for all 3D elements
- Validate NX CAD expression generation after geometry changes
- Test both dark/light themes for all UI changes
- Check mobile 3D performance impact
- Verify logging system captures relevant activities
- Ensure cost calculations remain accurate
- Test responsive design across device sizes

DEPLOYMENT WORKFLOW COMPLIANCE:
- Follow AutoCrate's three-step process: develop → prepare → deploy
- Use ./autocrate commands for consistency
- Respect user-controlled deployment policy (no automatic pushes)
- Clean codebase maintenance (no temp scripts or duplicate files)

I'll keep the dev server running and iterate with you until you're satisfied. Each change will be immediately visible at localhost:3000 with full 3D and calculation functionality.

What would you like to fix or improve in AutoCrate?
```

---

## How to Use This Workflow

### 1. Start Your Session

Open ONE terminal and paste the entire prompt above.

### 2. Describe Your Issue

AutoCrate-specific examples:
- "The 3D crate appears too dark in light mode"
- "Add validation for minimum crate dimensions"
- "The mobile layout cuts off the NX instructions"
- "Improve the cost calculation precision"
- "Fix the theme toggle animation"
- "The skid calculation isn't updating correctly"
- "Add tooltips to the dimension inputs"

### 3. Iterate Together

The AI will:
- Create a feature branch
- Start the dev server (keeps running)
- Make your requested changes
- Test 3D visualization if relevant
- Verify NX expressions if geometry-related
- Show you the results
- Wait for feedback

You can:
- Test at localhost:3000
- Check 3D visualization
- Test NX Instructions tab
- Verify cost calculations
- Test mobile responsiveness
- Request adjustments
- Add more changes

### 4. Keep Going

Continue the conversation:
```
You: "Make the crate walls slightly transparent"
AI: [Updates 3D material, commits, shows result]

You: "Now add a wireframe toggle button"
AI: [Adds UI control, implements wireframe mode, commits]

You: "Can we make it remember the wireframe setting?"
AI: [Integrates with theme store for persistence, commits]
```

### 5. Deploy When Ready

When satisfied, just say: **"deploy"**

The AI will:
1. Run ./autocrate prepare (all quality checks)
2. Push the branch to GitHub
3. Guide you through ./autocrate deploy
4. Verify production deployment
5. Clean up everything

---

## Example AutoCrate Conversation

```
You: "The skid dimensions aren't updating when I change the crate size"

AI: Creating branch feature/auto-20250108-171500-skid-update...
    Starting dev server with ./autocrate dev...
    
    Analyzing: The skid calculation in costCalculator.ts needs to trigger 
    when crate dimensions change in crateStore.ts
    
    Implementing fix:
    - /src/services/costCalculator.ts: Updated skid calculation logic
    - /src/store/crateStore.ts: Added skid dimension reactivity
    - /src/components/BillOfMaterials.tsx: Updated display formatting
    
    Committed: "fix: skid dimensions now update with crate size changes"
    
    Test at localhost:3000 - try changing length/width and check BOM section

You: "Good! But can we round the skid dimensions to the nearest half-inch?"

AI: Updating skid dimension rounding...
    
    Modified /src/services/costCalculator.ts:
    - Added roundToNearestHalf utility function
    - Applied rounding to skid length and width calculations
    - Updated cost calculations to use rounded dimensions
    
    Committed: "feat: round skid dimensions to nearest half-inch"
    
    Changes visible at localhost:3000 - skid dimensions now show cleaner values

You: "Perfect! Also add a note explaining the skid sizing logic"

AI: Adding skid sizing explanation...
    
    Updated /src/components/BillOfMaterials.tsx:
    - Added collapsible info section for skid calculations
    - Included weight-based sizing rules explanation
    - Added visual indicators for calculation method
    
    Committed: "docs: add skid sizing calculation explanation"
    
    Check the BOM section for the new info panel

You: "deploy"

AI: Starting deployment preparation...
    
    Running quality checks:
    ✓ ./autocrate prepare - all checks passed
    ✓ TypeScript validation - no errors
    ✓ ESLint - no warnings
    ✓ Build test - successful
    ✓ Unit tests - all passing
    
    Pushing branch to GitHub:
    git push -u origin feature/auto-20250108-171500-skid-update
    
    Branch ready for deployment. Run './autocrate deploy' when ready.
    
    Changes include:
    - Fixed skid dimension reactivity
    - Added half-inch rounding
    - Improved user documentation
```

---

## Key Differences from Major Changes Workflow

| Aspect | Minor Changes (This) | Major Changes |
|--------|---------------------|---------------|
| Terminals | 1 | 3 |
| Execution | Sequential dialogue | Parallel execution |
| Dev Server | Stays running | Build each iteration |
| Testing Scope | Focused on changes | Comprehensive coverage |
| Documentation | Inline updates | Complete documentation overhaul |
| Deployment | User-controlled trigger | Coordinated deployment |
| 3D Focus | Targeted fixes | Comprehensive 3D features |
| Best For | Bug fixes, tweaks | Major features, refactoring |

---

## AutoCrate-Specific Tips

### 3D Visualization Changes
1. **Test Immediately**: Check localhost:3000 after geometry changes
2. **Coordinate Validation**: Ensure Z-up system maintained
3. **Mobile Testing**: 3D performance varies significantly on mobile
4. **Theme Consistency**: Test both dark and light modes for 3D elements

### Calculation & Logic Changes
1. **Precision Matters**: Engineering calculations need accuracy
2. **Unit Consistency**: Everything should remain in inches
3. **Edge Cases**: Test with extreme dimensions (very small/large crates)
4. **Cost Validation**: Verify BOM calculations make sense

### UI/UX Improvements
1. **Responsive First**: Mobile layout is separate from desktop
2. **Theme Integration**: Use theme store for consistent styling
3. **Accessibility**: Maintain keyboard navigation and screen reader support
4. **Performance**: Monitor bundle size impact

### State Management
1. **Store Integration**: Use appropriate Zustand store for persistence
2. **Logging**: Add relevant activities to logs store
3. **Reactivity**: Ensure derived calculations update automatically
4. **Cleanup**: Limit log entries to prevent memory issues

---

## When to Use This Workflow

✅ **Use for:**
- 3D visualization bug fixes
- Calculation accuracy improvements
- UI/UX refinements
- Mobile responsiveness fixes
- Theme-related adjustments
- Input validation enhancements
- Performance optimizations (minor)
- Documentation updates
- Feature toggles and settings

❌ **Don't use for:**
- Major 3D feature additions
- Complete calculation system overhauls
- New material/cost systems
- Large-scale refactoring
- Breaking changes to geometry system
- Multi-component feature additions

---

## AutoCrate Agent Knowledge Applied

The prompt automatically applies specialized knowledge:

- **3D Visualization**: Maintains Z-up coordinate system, validates geometry
- **Crate Engineering**: Ensures calculation accuracy, validates engineering logic
- **UI/UX**: Preserves responsive design, theme consistency
- **Testing**: Validates changes don't break existing functionality
- **Performance**: Monitors 3D rendering impact, bundle size
- **Documentation**: Maintains Obsidian compatibility, updates inline docs
- **State Management**: Proper store integration and data flow
- **Deployment**: Follows AutoCrate's controlled deployment workflow

This comprehensive knowledge is automatically applied to all your minor changes, ensuring consistency with AutoCrate's engineering-focused design system.