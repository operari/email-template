const Email = require('email-templates');
const path = require('path');

const email = new Email({
  juice: true,
  preview: {
    id: 'output',
    dir: path.resolve('./build/output'),
    open: true
  },
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.resolve('.')
    }
  },
  message: {
    from: 'niftylettuce@gmail.com'
  },
  send: true,
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