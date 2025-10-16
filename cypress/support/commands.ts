/// <reference types="cypress" />

//Login Commands
Cypress.Commands.add('login', (MobileNumber, OTP) => {
  cy.visit('/');
  cy.get('input[name=phone]').type(MobileNumber);
  cy.contains('Send OTP').click();
  for (let i = 0; i < 6; i++) {
    cy.get('input[type=number]').then(($input) => {
    }).eq(i).type(OTP[i]);
    cy.wait(100)
  }
  cy.log('Before clicking Login');
  cy.contains('Login').should('exist').click();
  cy.log('After clicking Login');
  cy.wait(1000)
});

//Logout Commnds 
Cypress.Commands.add('logout', () => {
 cy.contains('Logout').click();
});
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }