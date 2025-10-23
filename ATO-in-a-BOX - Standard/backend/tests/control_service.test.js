// backend/tests/control_service.test.js
const { 
    calculateComplianceScore, 
    updateControlStatus, 
    findDeficiencies 
} = require('../services/ControlService'); 
// Assuming a service file handles the core logic

describe('Control Service Logic', () => {

    const mockControls = [
        { control_id: 'AC-1', status: 'Implemented' },
        { control_id: 'AC-2', status: 'Partially Implemented' },
        { control_id: 'AC-3', status: 'Not Implemented' },
        { control_id: 'PL-1', status: 'Not Applicable' },
    ];

    // --- Test: Compliance Score Calculation ---
    test('should correctly calculate compliance score (50% implemented)', () => {
        // Total Applicable: 3 (AC-1, AC-2, AC-3)
        // Implemented equivalent: 1 (AC-1) + 0.5 (AC-2) = 1.5
        // Score: (1.5 / 3) * 100 = 50
        const score = calculateComplianceScore(mockControls);
        expect(score).toBe(50);
    });

    test('should return 100% when all applicable controls are Implemented', () => {
        const fullControls = mockControls.map(c => 
            (c.status === 'Not Applicable') ? c : { ...c, status: 'Implemented' }
        );
        const score = calculateComplianceScore(fullControls);
        expect(score).toBe(100);
    });

    // --- Test: Status Update Functionality ---
    test('should update the status of a specific control', async () => {
        // Mock the database update function
        const mockUpdate = jest.fn((id, newStatus) => ({ control_id: id, status: newStatus }));

        const updatedControl = await updateControlStatus(
            'AC-3', 
            'Implemented', 
            mockControls, 
            mockUpdate
        );

        expect(mockUpdate).toHaveBeenCalledWith('AC-3', 'Implemented');
        expect(updatedControl.status).toBe('Implemented');
    });

    // --- Test: Deficiency Finding (for POA&M generation) ---
    test('should correctly identify Not Implemented controls as deficiencies', () => {
        const deficiencies = findDeficiencies(mockControls);
        expect(deficiencies).toHaveLength(1);
        expect(deficiencies[0].control_id).toBe('AC-3');
    });
});