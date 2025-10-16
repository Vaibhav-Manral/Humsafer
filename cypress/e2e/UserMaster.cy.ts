///<reference types="Cypress" />

describe('Test case for User Master',()=>{
    beforeEach(()=>{
        cy.login('7777777777','123456')
    })

    afterEach(()=>{
        cy.logout();
    })

    const firstName = 'Dhanwardhini'
    const lastName = 'Bhalerao'
    const email = 'dhanwardhini@gmail.com'
    const mobileNumber = '8805766249'
    it('Add New User',()=>{
        cy.contains('Users').click();
        cy.contains('Add User').click();
        cy.get('input[name=firstName]').type(firstName);
        cy.get('input[name=lastName]').type(lastName);
        cy.get('input[name=email]').type(email);
        cy.get('input[name=mobileNumber]').type(mobileNumber);
        cy.get(".MuiSelect-select").click(); //click on the Capabilities button 
        const Capabilities1 = 'ALL_DMS_FEATURES';
        const Capabilities2 = 'ADD_SHIPMENT';
        const Capabilities3 = 'VIEW_SHIPMENTS';
        const Capabilities4 = 'VIEW_SHIPMENT_DETAILS';
        const Capabilities5 = 'SET_SHIPMENT_PRIORITY';
        const Capabilities6 = 'SET_SHIPMENT_STATUS';
        const Capabilities7 = 'VIEW_COMPANY_ANALYTICS';
        const Capabilities8 = 'MANAGE_COMPANY_USERS';
        cy.contains(Capabilities1).click();
        cy.contains(Capabilities2).click();
        cy.get('body').type('{esc}');
        cy.get('button:contains("Add")').eq(1).click();
        cy.wait(2000)
        cy.get('div').should('contain','User added successfully');
    });

    it('Add user without firstname',()=>{
        cy.contains('Users').click();
        cy.contains('Add User').click();
        //cy.get('input[name=firstName]').type();
        cy.get('input[name=lastName]').type(lastName);
        cy.get('input[name=email]').type(email);
        cy.get('input[name=mobileNumber]').type(mobileNumber);
        cy.get(".MuiSelect-select").click();
        const Capabilities1 = 'ALL_DMS_FEATURES';
        cy.contains(Capabilities1).click();
        cy.get('body').type('{esc}');
        cy.get('button:contains("Add")').eq(1).click();
        cy.get('[name="firstName"]').should('have.attr', 'aria-invalid', 'true');
        cy.get('[data-testid="CancelOutlinedIcon"]').click();
    })

    it('Add user without lastname',()=>{
        cy.contains('Users').click();
        cy.contains('Add User').click();
        cy.get('input[name=firstName]').type(firstName);
        //cy.get('input[name=lastName]').type('Bhalerao');
        cy.get('input[name=email]').type(email);
        cy.get('input[name=mobileNumber]').type(mobileNumber);
        cy.get(".MuiSelect-select").click();
        const Capabilities1 = 'ALL_DMS_FEATURES';
        cy.contains(Capabilities1).click();
        cy.get('body').type('{esc}');
        cy.get('button:contains("Add")').eq(1).click();
        cy.get('[name=lastName]').should('have.attr', 'aria-invalid', 'true');
        cy.get('[data-testid="CancelOutlinedIcon"]').click();
    })

    it('Add user without email id',()=>{
        cy.contains('Users').click();
        cy.contains('Add User').click();
        cy.get('input[name=firstName]').type(firstName);
        cy.get('input[name=lastName]').type(lastName);
        //cy.get('input[name=email]').type(email);
        cy.get('input[name=mobileNumber]').type(mobileNumber);
        cy.get(".MuiSelect-select").click();
        const Capabilities1 = 'ALL_DMS_FEATURES';
        cy.contains(Capabilities1).click();
        cy.get('body').type('{esc}');
        cy.get('button:contains("Add")').eq(1).click();
        cy.get('[name=email]').should('have.attr', 'aria-invalid', 'true');
        cy.get('[data-testid="CancelOutlinedIcon"]').click();
    })

    it('Add user without Mobile number',()=>{
        cy.contains('Users').click();
        cy.contains('Add User').click();
        cy.get('input[name=firstName]').type(firstName);
        cy.get('input[name=lastName]').type(lastName);
        cy.get('input[name=email]').type(email);
        //cy.get('input[name=mobileNumber]').type(mobileNumber);
        cy.get(".MuiSelect-select").click();
        const Capabilities1 = 'ALL_DMS_FEATURES';
        cy.contains(Capabilities1).click();
        cy.get('body').type('{esc}');
        cy.get('button:contains("Add")').eq(1).click();
        cy.get('[name=mobileNumber]').should('have.attr', 'aria-invalid', 'true');
        cy.get('[data-testid="CancelOutlinedIcon"]').click();
    })
})