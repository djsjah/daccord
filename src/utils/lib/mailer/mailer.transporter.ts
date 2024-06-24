import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class MailerTransporter {
  private readonly mailerTransporter: Transporter;
  private readonly transporterConfig: SMTPTransport.Options;

  constructor(transporterConfig: SMTPTransport.Options) {
    this.transporterConfig = transporterConfig;
    this.mailerTransporter = nodemailer.createTransport(this.transporterConfig);
  }

  public async sendMailByTransporter(mailOptions: SendMailOptions): Promise<void> {
    await this.mailerTransporter.sendMail(mailOptions);
  }

  public getMailerTransporter(): Transporter {
    return this.mailerTransporter;
  }
}
export default MailerTransporter;
