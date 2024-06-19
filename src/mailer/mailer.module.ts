import MailerTransporter from './mailer.transporter';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import dependencyContainer from '../dependencyInjection/dependency.container';

class MailerModule {
  constructor(transporterConfig: SMTPTransport.Options) {
    dependencyContainer.registerInstance('mailerTransporter', new MailerTransporter(transporterConfig));
  }
}
export default MailerModule;
