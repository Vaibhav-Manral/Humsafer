///<reference types ="cypress"/>

describe('Test case For ShipmentList Master', () => {
    beforeEach(() => {
        cy.login('7777777777', '123456')
    });

    afterEach(() => {
        cy.logout();
    })

    it('See All the Shipment Button', () => {
        cy.contains("Shipments List").click();
        cy.contains('Today').click();
        cy.contains('Past 7 days').click();
        cy.contains(' Past 1 month').click();
        cy.contains('All Shipments').click();
        cy.contains('App setup incomplete').click();
        cy.contains('In Transit').click();
        cy.contains('Untracked').click();
        cy.contains('Completed').click();
        cy.contains('Prioritized').click();
        cy.contains('Refresh').click();
    })

    const ShipmentID = 'CXL3777'; ///Add shipment id here To run all the Test case .

    it('Add the Shipment In to the Prioritised', () => {
        cy.contains("Shipments List").click();
        cy.contains(ShipmentID).click();
        cy.contains('Prioritise').click();
        cy.get('div').should('contain', 'Shipment priority PRIORITIZED set successfully');
    })

    it('Remove the Shipment from the Prioritised list', () => {
        cy.contains("Shipments List").click();
        cy.contains(ShipmentID).click();
        cy.contains('Prioritise').click();
        cy.get('div').should('contain', 'Shipment priority DEFAULT set successfully');
    })

    it('Copy the shipment Link', () => {
        cy.contains("Shipments List").click();
        cy.contains(ShipmentID).parent().find('[aria-label="more"]').click();
        cy.contains('Share link').click();
        cy.get('div').should('contain', 'Shipment link copied');
    })

    it('Search The Shipment', () => {
        cy.contains("Shipments List").click();
        cy.get('.ShipmentsList_shipment_top_bar_search__8PMKh').type(ShipmentID);
    })

    it('Filter the Shipment', () => {
        const From = 'Pune';
        const To = 'Pune';
        cy.contains("Shipments List").click();
        cy.get('[data-testid="FilterAltIcon"]').click();
        cy.get('[role="combobox"]').eq(0).click();
        cy.get('li[role="option"]').contains(From).click();
        cy.get('[role="combobox"]').eq(1).type(To);
        cy.get('li[role="option"]').contains(To).click();
        cy.contains('Search').click();
    })

})
