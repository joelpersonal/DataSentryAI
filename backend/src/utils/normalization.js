const Fuse = require('fuse.js');

// Standard Dictionaries
const STANDARD_INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 
  'Manufacturing', 'Real Estate', 'Transportation', 'Energy', 
  'Telecommunications', 'Media', 'Entertainment', 'Construction', 
  'Agriculture', 'Aerospace', 'Automotive', 'Chemicals', 'Hospitality'
];

const STANDARD_FUNCTIONS = [
  'Sales', 'Marketing', 'Engineering', 'IT', 'Finance', 'HR', 
  'Operations', 'Legal', 'Product', 'Design', 'Support', 'Executive'
];

const STANDARD_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 
  'Sales Representative', 'Marketing Manager', 'Account Executive',
  'CEO', 'CTO', 'CFO', 'Director', 'VP', 'Manager', 'Analyst',
  'HR Manager', 'System Administrator', 'DevOps Engineer'
];

// Configure Fuse options
const fuseOptions = {
  includeScore: true,
  threshold: 0.4, // Lower threshold means stricter matching
};

const industryFuse = new Fuse(STANDARD_INDUSTRIES, fuseOptions);
const functionFuse = new Fuse(STANDARD_FUNCTIONS, fuseOptions);
const titleFuse = new Fuse(STANDARD_TITLES, fuseOptions);

const normalizeIndustry = (input) => {
  if (!input) return { value: input, confidence: 0, changed: false };
  
  const results = industryFuse.search(input);
  if (results.length > 0) {
    const bestMatch = results[0];
    const confidence = 1 - bestMatch.score;
    // If exact match or very high confidence
    if (confidence > 0.95 && input.toLowerCase() === bestMatch.item.toLowerCase()) {
        return { value: bestMatch.item, confidence: 1.0, changed: false }; 
    }
    return { 
      value: bestMatch.item, 
      original: input,
      confidence: Math.round(confidence * 100) / 100, 
      changed: input !== bestMatch.item 
    };
  }
  return { value: input, confidence: 0, changed: false };
};

const normalizeFunction = (input) => {
  if (!input) return { value: input, confidence: 0, changed: false };

  // Common abbreviations
  const abbreviations = {
    'eng': 'Engineering',
    'mktg': 'Marketing',
    'ops': 'Operations',
    'hr': 'HR',
    'tech': 'IT',
    'info tech': 'IT'
  };

  if (abbreviations[input.toLowerCase()]) {
    return { value: abbreviations[input.toLowerCase()], confidence: 1.0, changed: true };
  }

  const results = functionFuse.search(input);
  if (results.length > 0) {
    const bestMatch = results[0];
    const confidence = 1 - bestMatch.score;
    if (confidence > 0.95 && input.toLowerCase() === bestMatch.item.toLowerCase()) {
         return { value: bestMatch.item, confidence: 1.0, changed: false };
    }
    return { 
      value: bestMatch.item, 
      original: input,
      confidence: Math.round(confidence * 100) / 100, 
      changed: input !== bestMatch.item 
    };
  }
  return { value: input, confidence: 0, changed: false };
};

const normalizeJobTitle = (input) => {
  if (!input) return { value: input, confidence: 0, changed: false };

  const results = titleFuse.search(input);
  if (results.length > 0) {
    const bestMatch = results[0];
    const confidence = 1 - bestMatch.score;
     if (confidence > 0.95 && input.toLowerCase() === bestMatch.item.toLowerCase()) {
        return { value: bestMatch.item, confidence: 1.0, changed: false };
    }
    return { 
      value: bestMatch.item, 
      original: input,
      confidence: Math.round(confidence * 100) / 100, 
      changed: input !== bestMatch.item 
    };
  }
  return { value: input, confidence: 0, changed: false };
};

const suggestDomainCorrection = (email) => {
    if (!email || !email.includes('@')) return null;
    
    const [user, domain] = email.split('@');
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domainFuse = new Fuse(commonDomains, { includeScore: true, threshold: 0.4 });
    
    const results = domainFuse.search(domain);
    if (results.length > 0) {
        const bestMatch = results[0];
        const confidence = 1 - bestMatch.score;
        if (confidence > 0.6 && domain !== bestMatch.item) {
             return { 
                value: `${user}@${bestMatch.item}`,
                original: email,
                confidence: Math.round(confidence * 100) / 100,
                type: 'email_correction'
            };
        }
    }
    return null;
}

module.exports = {
  normalizeIndustry,
  normalizeFunction,
  normalizeJobTitle,
  suggestDomainCorrection
};
