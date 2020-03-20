const Email = require('email-templates');
const path = require('path');

const email = new Email({
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.resolve('build')
    }
  },
  message: {
    from: 'niftylettuce@gmail.com'
  },
  // uncomment below to send emails in development/test env:
  // send: true
  transport: {
    jsonTransport: true
  }
});

email
  .send({
    template: 'mars',
    message: {
      to: 'elon@spacex.com'
    },
    locals: {
      name: 'David Swith'
    }
  })
  .then(console.log)
  .catch(console.error);