/**
 * NIST SP 800-53 Rev 5.1.1 Control Catalog Integration (CommonJS)
 */

// Use require for JSON - Make sure your NIST_SP-800-53_rev5_catalog.json file is in the same directory
const nist_controls_data = require('./NIST_SP-800-53_rev5_catalog.json');

/* ------------------------------------------------------
 * CONTROL FAMILY CODE MAP (20 Families)
 * ---------------------------------------------------- */
exports.CONTROL_FAMILIES_CODES = [
  'AC',
  'AT',
  'AU',
  'CA',
  'CM',
  'CP',
  'IA',
  'IR',
  'MA',
  'MP',
  'PE',
  'PL',
  'PM',
  'PS',
  'RA',
  'SA',
  'SC',
  'SI',
  'SR',
  'PT',
];

/* ------------------------------------------------------
 * FAMILY DISPLAY LABELS (Optional for UI)
 * ---------------------------------------------------- */
exports.CONTROL_FAMILY_LABELS = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CA: 'Assessment, Authorization, and Monitoring',
  CM: 'Configuration Management',
  CP: 'Contingency Planning',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PE: 'Physical and Environmental Protection',
  PL: 'Planning',
  PM: 'Program Management',
  PS: 'Personnel Security',
  RA: 'Risk Assessment',
  SA: 'System and Services Acquisition',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity',
  SR: 'Supply Chain Risk Management',
  PT: 'Privacy',
};

/* ------------------------------------------------------
 * BUILD FULL CONTROL CATALOG
 * ---------------------------------------------------- */
exports.createFullControlCatalog = () => {
  if (!nist_controls_data?.catalog?.groups) {
    console.error('Invalid NIST control data structure — check JSON import path.');
    return { initialControls: [], initialAssessments: [] };
  }

  // Flatten every control in every group
  const controls = nist_controls_data.catalog.groups.flatMap((group) => {
    const familyCode = group.id?.toUpperCase() || 'UNK';
    const familyTitle = group.title || familyCode;
    return (group.controls || []).map((ctrl) => ({
      id: ctrl.id?.toUpperCase() || '',
      family: familyTitle,
      title: ctrl.title || '',
      status: 'Not Implemented',
      procedure: '',
      artifacts: [],
      inheritance: 'System Specific',
      // Storing severity (mocked for now, from App.jsx logic)
      severity:
        ctrl.id?.startsWith('PM-') || ctrl.id?.startsWith('CA-')
          ? 'High'
          : 'Moderate',
      findings: [], // <-- Added empty array for scan results
      assessment_objectives_tree: (ctrl.parts || [])
        .filter((p) => p.name?.includes('assessment-objective'))
        .map((p) => ({
          label:
            p.props?.find((pr) => pr.name === 'label')?.value ||
            ctrl.id?.toUpperCase(),
          text: p.prose || '',
        })),
      assessment_methods: (ctrl.parts || [])
        .filter((p) => p.name?.includes('assessment-method'))
        .map((p) => ({
          method:
            p.props?.find((pr) => pr.name === 'method')?.value || 'EXAMINE',
          details:
            p.parts?.[0]?.prose?.trim() ||
            'Review documentation, interview personnel, test control operation.',
        })),
      _meta: {
        family_code: familyCode,
        source_catalog: 'NIST SP 800-53 Rev 5.1.1',
        build_version: nist_controls_data.catalog.metadata?.version || '5.1.1',
        build_date: new Date().toISOString(),
      },
    }));
  });

  return {
    initialControls: controls,
    initialAssessments: [], // reserved for assessment data
  };
};