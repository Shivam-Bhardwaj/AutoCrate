# AutoCrate TODO

## 3D Visualization Improvements

- [x] Fix initial camera position to properly frame the crate.
- [x] Fix confusing and redundant labels on the coordinate axes.
- [ ] **Implement True Exploded View:** The "Explode View" button is currently a placeholder. The `_explodeFactor` prop in `CrateModel` needs to be implemented to programmatically separate the crate panels and provide a true exploded view.
- [ ] **Add Dimension Lines to Exploded View:** When the view is exploded, draw lines and labels to indicate the crate's width, depth, and height.
- [ ] **Final Verification:** Verify the final 3D visualization in the browser to confirm all fixes and new features.