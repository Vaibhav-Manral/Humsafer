///<reference types="Cypress" />
describe('Edit the user Data',()=>{
    beforeEach(()=>{
        cy.login('7777777777','123456')
    })

    afterEach(()=>{
        cy.logout();
    })
    const Editusername = 'Bhalerao Accucia'
    const FirstName = 'Bhalerao';
    const lastName = 'Accucia';
    const email = 'accucia@gmail.com'
    it('Edit FirstName',()=>{
        cy.contains('Users').click();
        cy.contains('tr',Editusername).find('button').click();
        cy.get('input[name=firstName]').clear();
        cy.get('input[name=firstName]').type(FirstName);
        cy.contains('button', 'Edit').click();
        cy.get('div').should('contain','User updated successfully');
    })
    it('Edit LastName',()=>{
        cy.contains('Users').click();
        cy.contains('tr',Editusername).find('button').click();
        cy.get('input[name=lastName]').clear();
        cy.get('input[name=lastName]').type(lastName);
        cy.contains('button', 'Edit').click();
        cy.get('div').should('contain','User updated successfully');
    })

    it('Edit email',()=>{
        cy.contains('Users').click();
        cy.contains('tr',Editusername).find('button').click();
        cy.get('input[name=email]').clear();
        cy.get('input[name=email]').type(email);
        cy.contains('button', 'Edit').click();
        cy.get('div').should('contain','User updated successfully');
    })
})