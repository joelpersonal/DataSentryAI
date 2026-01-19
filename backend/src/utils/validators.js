// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Phone validation (flexible format)
const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
};

// Date validation (multiple formats)
const validateDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
};

// URL validation
const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Calculate confidence score for duplicate matches
const calculateConfidenceScore = (matches) => {
  if (!matches || matches.length === 0) return 0;

  const avgSimilarity = matches.reduce((sum, match) => {
    return sum + (1 - match.score);
  }, 0) / matches.length;

  return Math.round(avgSimilarity * 100);
};

// Validate postal code (basic)
const validatePostalCode = (postalCode, country = 'US') => {
  const patterns = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/
  };

  const pattern = patterns[country.toUpperCase()] || patterns.US;
  return pattern.test(postalCode.trim());
};

// Check if value is likely a name
const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-\'\.]{2,50}$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2;
};

// Validate numeric values
const validateNumeric = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

// Auto-detect field type based on header name and content
const detectFieldType = (headerName, sampleValues) => {
  const header = headerName.toLowerCase();

  // Email detection
  if (header.includes('email') || header.includes('mail')) {
    return 'email';
  }

  // Phone detection
  if (header.includes('phone') || header.includes('tel') || header.includes('mobile')) {
    return 'phone';
  }

  // Date detection
  if (header.includes('date') || header.includes('time') || header.includes('created') || header.includes('updated')) {
    return 'date';
  }

  // URL detection
  if (header.includes('url') || header.includes('website') || header.includes('link') || header.includes('domain')) {
    return 'url';
  }

  // Revenue/Numeric detection
  if (header.includes('revenue') || header.includes('price') || header.includes('amount') || header.includes('salary') ||
    header.includes('cost') || header.includes('quantity') || header.includes('size')) {
    return 'numeric';
  }

  // Country detection
  if (header.includes('country') || header.includes('nation')) {
    return 'country';
  }

  // Job Title detection
  if (header.includes('title') || header.includes('role')) {
    return 'job_title';
  }

  return 'text';
};

// Check for common data quality issues
const detectDataIssues = (value, fieldType = 'text') => {
  const issues = [];

  if (!value || value.trim() === '') {
    issues.push({ type: 'missing', severity: 'medium' });
    return issues;
  }

  const trimmedValue = value.trim();

  // Check for placeholder values
  const placeholders = ['n/a', 'null', 'undefined', 'tbd', 'tba', 'xxx', '---', 'na', 'none', 'empty'];
  if (placeholders.includes(trimmedValue.toLowerCase())) {
    issues.push({ type: 'placeholder', severity: 'medium' });
  }

  // Check for excessive length
  if (trimmedValue.length > 255) {
    issues.push({ type: 'too_long', severity: 'low' });
  }

  // Check for suspicious characters
  if (/[<>{}[\]\\\/\|]/.test(trimmedValue)) {
    issues.push({ type: 'suspicious_chars', severity: 'low' });
  }

  // Field-specific validation
  switch (fieldType.toLowerCase()) {
    case 'email':
      if (!validateEmail(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'high' });
      }
      break;
    case 'phone':
      if (!validatePhone(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'medium' });
      }
      break;
    case 'date':
      if (!validateDate(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'medium' });
      }
      break;
    case 'url':
      if (!validateURL(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'medium' });
      }
      break;
    case 'name':
      if (!validateName(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'low' });
      }
      break;
    case 'numeric':
      if (!validateNumeric(trimmedValue)) {
        issues.push({ type: 'invalid_format', severity: 'medium' });
      }
      break;
    case 'id':
      if (trimmedValue.length === 0) {
        issues.push({ type: 'empty_id', severity: 'high' });
      }
      break;
  }

  return issues;
};

const validateCompanyRecord = (record) => {
  const issues = [];

  // Helper to find value by possible keys
  const getVal = (keys) => {
    for (const k of keys) {
      if (record[k]) return { value: record[k], key: k };
    }
    return { value: null, key: keys[0] };
  };

  const nameObj = getVal(['company_name', 'name', 'company', 'company name']);
  const websiteObj = getVal(['website', 'url']);
  const domainObj = getVal(['domain']);
  const revenueObj = getVal(['revenue', 'annual revenue']);
  const countryObj = getVal(['country', 'location', 'hq']);
  const industryObj = getVal(['industry', 'sector']);

  // Check Name (Mandatory)
  if (!nameObj.value) {
    issues.push({
      field: nameObj.key,
      issue: 'Missing company name',
      type: 'Missing Data',
      severity: 'high',
      explanation: 'The company name is mandatory for identification.',
      recommendation: 'Verify official company legal name.'
    });
  }

  // Check Website/Domain (Mandatory format)
  if (!websiteObj.value) {
    issues.push({
      field: websiteObj.key,
      issue: 'Missing website',
      type: 'Missing Data',
      severity: 'high',
      explanation: 'Website is required for domain and legitimacy verification.',
      recommendation: 'Add company website.'
    });
  } else if (!validateURL(websiteObj.value)) {
    issues.push({
      field: websiteObj.key,
      issue: 'Invalid website URL',
      type: 'Invalid Format',
      severity: 'medium',
      explanation: 'The website format is incorrect or inaccessible.',
      recommendation: 'Correct URL format (e.g., https://company.com).'
    });
  }

  // Domain Mismatch Check (Mandatory SPEC)
  if (websiteObj.value && domainObj.value) {
    try {
      const url = new URL(websiteObj.value);
      const urlDomain = url.hostname.replace('www.', '').toLowerCase();
      const providedDomain = domainObj.value.toLowerCase().trim();

      if (urlDomain !== providedDomain && !urlDomain.endsWith('.' + providedDomain)) {
        issues.push({
          field: domainObj.key,
          issue: 'Domain mismatch',
          type: 'Schema Mismatch',
          severity: 'high',
          explanation: `The domain field (${providedDomain}) does not match the website host (${urlDomain}).`,
          recommendation: `Update domain to match website: ${urlDomain}`
        });
      }
    } catch (e) {
      // Invalids handled by website check
    }
  }

  // Check Revenue (Must be Numeric)
  if (revenueObj.value && !validateNumeric(revenueObj.value)) {
    issues.push({
      field: revenueObj.key,
      issue: 'Revenue not numeric',
      type: 'Invalid Format',
      severity: 'medium',
      explanation: 'Revenue must be a numeric value for financial analysis.',
      recommendation: 'Remove currency symbols or text.'
    });
  }

  // Check Country or Industry (Mandatory)
  if (!countryObj.value) {
    issues.push({
      field: countryObj.key,
      issue: 'Missing country',
      type: 'Missing Data',
      severity: 'medium',
      explanation: 'Country data is required for geographical segmentation.',
      recommendation: 'Enter HQ country.'
    });
  }

  if (!industryObj.value) {
    issues.push({
      field: industryObj.key,
      issue: 'Missing industry',
      type: 'Missing Data',
      severity: 'medium',
      explanation: 'Industry classification is required for B2B targeting.',
      recommendation: 'Map to standard industry.'
    });
  }

  return issues;
};

const validatePersonRecord = (record) => {
  const issues = [];

  const getVal = (keys) => {
    for (const k of keys) {
      if (record[k]) return { value: record[k], key: k };
    }
    return { value: null, key: keys[0] };
  };

  const nameObj = getVal(['person_name', 'name', 'full name', 'person']);
  const titleObj = getVal(['job_title', 'title', 'role', 'position']);
  const emailObj = getVal(['email', 'mail', 'email address']);
  const phoneObj = getVal(['phone', 'mobile', 'cell']);

  // Check Name
  if (!nameObj.value) {
    issues.push({
      field: nameObj.key,
      issue: 'Missing name',
      type: 'Missing Data',
      severity: 'high',
      explanation: 'A target contact must have a identifiable name.',
      recommendation: 'Extract name from email or database.'
    });
  }

  // Check Title
  if (!titleObj.value) {
    issues.push({
      field: titleObj.key,
      issue: 'Missing job title',
      type: 'Missing Data',
      severity: 'high',
      explanation: 'Job title is required for Persona mapping.',
      recommendation: 'Assign standard title.'
    });
  }

  // Check Email
  if (!emailObj.value) {
    issues.push({
      field: emailObj.key,
      issue: 'Missing email',
      type: 'Missing Data',
      severity: 'high',
      explanation: 'Email is the primary communication channel.',
      recommendation: 'Verify contact email.'
    });
  } else if (!validateEmail(emailObj.value)) {
    issues.push({
      field: emailObj.key,
      issue: 'Invalid email format',
      type: 'Invalid Format',
      severity: 'high',
      explanation: 'Email address does not follow standard RFC formats.',
      recommendation: 'Correct email syntax (e.g., user@domain.com).'
    });
  }

  // Check Phone
  if (phoneObj.value && !validatePhone(phoneObj.value)) {
    issues.push({
      field: phoneObj.key,
      issue: 'Invalid phone format',
      type: 'Invalid Format',
      severity: 'medium',
      explanation: 'Phone number contains invalid characters or length.',
      recommendation: 'Standardize to E.164 format.'
    });
  }

  return issues;
};


module.exports = {
  validateEmail,
  validatePhone,
  validateDate,
  validateURL,
  validatePostalCode,
  validateName,
  validateNumeric,
  calculateConfidenceScore,
  detectDataIssues,
  detectFieldType,
  validateCompanyRecord,
  validatePersonRecord
};