# Relativum

Relativum is a 100% static, private questionnaire tool for mapping people onto a relative space using a Polis-style PCA + clustering pipeline. Everything runs locally in the browser (no server, no Node.js).

## Features
- Register people (A, B, C…), answer 36 fixed questions per person
- Autosave to `localStorage`
- Export/import JSON
- 3D (PC1/PC2/PC3) and 2D projections + accessible table
- Nearest-people view with distance metrics
- Adjustable weights and accessibility settings

## Run locally
Any static server works. Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`.

You can also open `index.html` directly as a file, but some browsers block `file://` module imports. A local server is recommended.

## GitHub Pages
Push this repository to GitHub and enable Pages on the `main` branch. No build step is required.

## Data
- Stored in browser `localStorage`
- Export/Import JSON from the main page
- Sample dataset: `sample-data.json`

## Structure
```
/
  index.html
  viz.html
  nearest.html
  settings.html
  /assets/
    /css/styles.css
    /js/
      questions.js
      app-state.js
      data-io.js
      analysis.js
      viz-2d.js
      viz-3d.js
      ui.js
      index.js
      viz-page.js
      nearest-page.js
      settings-page.js
  sample-data.json
```

## Notes
- PCA is computed in-browser with a lightweight power-iteration eigen solver.
- Clustering uses k-means++ with silhouette selection and stability gating.
