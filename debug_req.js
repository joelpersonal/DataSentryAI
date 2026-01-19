try {
    const validators = require('./backend/src/utils/validators');
    console.log("Validators loaded keys:", Object.keys(validators));

    const analysis = require('./backend/src/controllers/analysisController');
    console.log("Analysis loaded.");
} catch (e) {
    console.error("DEBUG ERROR:", e);
}
