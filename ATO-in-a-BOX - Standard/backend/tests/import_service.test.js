// backend/tests/import_service.test.js
const { 
    processEmassCsv, 
    processNessusScan 
} = require('../services/ImportService'); 
// Assuming a service file handles import logic

// Mock the dependencies: control service and mapping data
jest.mock('../services/ControlService'); 
jest.mock('../data/mappings/nessus_map.json'); 
const { updateControlStatus } = require('../services/ControlService');

describe('Import Service Logic', () => {
    
    // --- Test: eMASS CSV Import ---
    test('should correctly parse eMASS CSV and update control narratives', async () => {
        const mockCsvData = "Control ID,Status,Narrative\nAC-2,Implemented,\"New narrative text here\"\nCM-6,Partially Implemented,\"CM description\"";
        
        // Mock a function that converts CSV to JSON or stream
        const mockCsvParser = (csv) => [
            { id: 'AC-2', status: 'Implemented', narrative: 'New narrative text here' },
            { id: 'CM-6', status: 'Partially Implemented', narrative: 'CM description' }
        ];

        // The actual function call (passing the raw data and the mock parsing tool)
        const updatedCount = await processEmassCsv(mockCsvData, mockCsvParser);

        // Expect the control update function to have been called twice
        expect(updateControlStatus).toHaveBeenCalledTimes(2);
        expect(updateControlStatus).toHaveBeenCalledWith(
            'AC-2', 
            'Implemented', 
            'New narrative text here'
        );
        expect(updatedCount).toBe(2);
    });

    // --- Test: Nessus Scan Processing ---
    test('should process Nessus finding and map it to the correct NIST control', async () => {
        // Mock the Nessus mapping file to return a known control
        const mockNessusMap = [{
            nessus_plugin_id: 10394,
            nist_controls: [{ control_id: 'AC-17 (1)', details: 'Secure protocols' }],
            default_status: 'Not Implemented'
        }];

        // Mock the raw finding data from a Nessus XML/JSON
        const mockFinding = { pluginId: 10394, severity: 'High' };

        // The actual function call
        const results = await processNessusScan(mockFinding, mockNessusMap);

        // Expect it to resolve to the mapped control
        expect(results.mappedControlId).toBe('AC-17');
        expect(results.suggestedStatus).toBe('Not Implemented');
    });
});