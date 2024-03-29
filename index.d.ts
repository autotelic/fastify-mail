import { FastifyPluginCallback } from 'fastify';
import { Transporter } from 'nodemailer';

type FastifyMail = FastifyPluginCallback<fastifyMail.FastifyMailOptions>;

declare module 'fastify' {
  interface FastifyInstance {
    mail: fastifyMail.FastifyMailDecorator;
  }
}

declare namespace fastifyMail {
  // Define the options for the plugin
  export interface FastifyMailOptions {
    pov?: {
      engine?: any;
      propertyName?: string;
      [key: string]: any;
    };
    transporter: Transporter;
  }

  // Define the shape of the mail decorator
  export interface FastifyMailDecorator {
    sendMail: (message: MailMessage, opts?: SendMailOptions) => Promise<any>;
    createMessage: (message: MailMessage, templatePath: string, context: any) => Promise<MailMessage>;
    validateMessage: (message: MailMessage) => string[];
  }

  // Define the shape of the message
  interface MailMessage {
    to?: string;
    from?: string;
    subject?: string;
    replyTo?: string;
    cc?: string;
    bcc?: string;
    html?: string;
    text?: string;
    [key: string]: any;
  }

  interface SendMailOptions {
    templatePath?: string;
    context?: any;
  }

  // Extend the FastifyInstance interface to include the new decorators
  export interface FastifyInstance {
    nodemailer: Transporter;
    mail: FastifyMailDecorator;
  }

  // The exported plugin function
  const fastifyMail: FastifyPluginCallback<FastifyMailOptions>;

  export { fastifyMail as default };
}

declare function fastifyMail(
  ...params: Parameters<FastifyMail>
): ReturnType<FastifyMail>;

export = fastifyMail;
