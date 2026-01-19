console.log("1");
try { require('./backend/src/services/ollamaService'); console.log("Ollama OK"); } catch (e) { console.error(e); }
console.log("2");
try { require('./backend/src/utils/jobMapper'); console.log("JobMapper OK"); } catch (e) { console.error(e); }
console.log("3");
try { require('./backend/src/utils/normalization'); console.log("Normalization OK"); } catch (e) { console.error(e); }
console.log("4");
try { require('./backend/src/utils/validators'); console.log("Validators OK"); } catch (e) { console.error(e); }
console.log("5");
try { require('./backend/src/controllers/analysisController'); console.log("AnalysisController OK"); } catch (e) { console.error(e); }
