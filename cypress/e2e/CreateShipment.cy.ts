///<reference types ="cypress"/>

describe('Shipment Master TestCases', () => {
    beforeEach(() => {
        cy.login('7777777777', '123456');
    });

    const vehicleNumber = 'MH 12 Dhanu';
    const from = 'Accucia Software';
    const to = 'More vasti chikhali';
    const MobileNo = '9356231641'; //Driver Phone number
    const FirstName = 'Dhanwardhini'; //Driver first name
    const LastName = 'Bhalerao'; //Driver Lastname

    it('Create New one way Shipment', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        // cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        // cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('input[name=expectedDriverMobileNumber]').type(MobileNo);
        cy.wait(2000)
        cy.get('input[name=expectedDriverFirstName]').type(FirstName);
        cy.get('input[name=expectedDriverLastName]').type(LastName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('div').should('contain', 'Your shipment has been successfully created, you can go to ‘All Shipments’ or create a new one')
    });

    it('Create New Round Way Shipment', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.contains('Round Trip').click();
        // cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        // cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date.
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('input[name=expectedDriverMobileNumber]').type(MobileNo);
        cy.wait(2000)
        cy.get('input[name=expectedDriverFirstName]').type(FirstName);
        cy.get('input[name=expectedDriverLastName]').type(LastName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('div').should('contain', 'Your shipment has been successfully created, you can go to ‘All Shipments’ or create a new one');
    });

    it('Add shipment without vehicleNumber', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.contains('Round Trip').click();
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date.
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('[name=vehicleNumber]').should('have.attr', 'aria-invalid', 'true');
    })

    it('Add shipment without form Address', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.contains('Round Trip').click();
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date.
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('[name=from]').should('have.attr', 'aria-invalid', 'true');
    })

    it('Add shipment without to Address', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.contains('Round Trip').click();
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date.
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains('Next').click();
        cy.get('[name=to]').should('have.attr', 'aria-invalid', 'true');
    })

    it('Create New without Transporter', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.contains('Round Trip').click();
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date.
        cy.contains('Next').click();
        cy.get('[name=associatedEntity]').should('have.attr', 'aria-invalid', 'true');
    });

    it('Create Shipment Driver FirstName', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('input[name=expectedDriverMobileNumber]').type(MobileNo);
        cy.wait(2000)
        cy.get('input[name=expectedDriverLastName]').type(LastName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('input[name=expectedDriverFirstName]').should('have.attr', 'aria-invalid', 'true');
    });

    it('Create Shipment Driver LastName', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('input[name=expectedDriverMobileNumber]').type(MobileNo);
        cy.wait(2000)
        cy.get('input[name=expectedDriverFirstName]').type(FirstName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('input[name=expectedDriverLastName]').should('have.attr', 'aria-invalid', 'true');
    });

    it('Create Shipment With out Mobile Number', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.wait(2000)
        cy.get('input[name=expectedDriverFirstName]').type(FirstName);
        cy.get('input[name=expectedDriverLastName]').type(LastName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('input[name=expectedDriverMobileNumber]').should('have.attr', 'aria-invalid', 'true');
    });

    it('Open All shipment Page After Shipement created', () => {
        cy.contains('Create Shipments').click();
        cy.get('input[name=vehicleNumber]').type(vehicleNumber);
        cy.get('input[name=from]').type(from);
        cy.wait(2000);
        cy.get('input[name=from]').type('{downarrow}');
        cy.get('input[name=from]').type('{enter}');
        cy.get('input[name=to]').type(to);
        cy.wait(2000);
        cy.get('input[name=to]').type('{downarrow}');
        cy.get('input[name=to]').type('{enter}');
        // cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click();
        // cy.get('button[aria-label="Oct 10, 2023"]').type('{esc}'); //Enter the Date
        cy.get('div.MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall.css-182didf').click();
        const Transporter = 'transporter 1';
        cy.contains(Transporter).click();
        cy.contains('Next').click();
        cy.get('input[name=expectedDriverMobileNumber]').type(MobileNo);
        cy.wait(2000)
        cy.get('input[name=expectedDriverFirstName]').type(FirstName);
        cy.get('input[name=expectedDriverLastName]').type(LastName);
        cy.get('button:contains("Create Shipment")').click();
        cy.get('div').should('contain', 'Your shipment has been successfully created, you can go to ‘All Shipments’ or create a new one');
        cy.get('.MuiButton-root').contains('All Shipments').click();
        cy.get('div').should('contain', 'All Shipments');
        cy.get('div').should('contain', 'Refresh');

    });

});
