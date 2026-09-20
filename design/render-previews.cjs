// Rebuild all editable layouts and 2x previews from the configured example content.
require('./render-layouts.cjs').main().catch(e=>{console.error(e);process.exitCode=1});

