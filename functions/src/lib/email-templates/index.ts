import fs from 'fs';
import mustache from 'mustache';
import { logData } from '../utils/log';
import { GenericObject } from '@/types/global';
import values from 'lodash/values';

/**
 * Email template file names
 * minus the html extension
 */
export enum EmailTemplates {
  Example = 'example',
}

/**
 * Email header template file names
 * minus the html extension
 */
export enum EmailHeaders {
  Default = 'default',
}

/**
 * Email footer template file names
 * minus the html extension
 */
export enum EmailFooters {
  Default = 'default',
}

type MakeEmailFromTemplateOptions = {
  headerOverride?: EmailHeaders;
  footerOverride?: EmailFooters;
};

/**
 * Returns a compiled HTML string to be sent in an email
 * @param {string} templateName name of the template to use
 * @param {object} data context for variable replacement in the template
 * @param {object} options
 * @param {string} options.headerOverride optional template overrides for header
 * @param {string} options.footerOverride optional template overrides for header
 * @returns {string}
 */
export function makeEmailFromTemplate(
  templateName: EmailTemplates,
  data: GenericObject,
  options: MakeEmailFromTemplateOptions = {},
) {
  logData('makeEmailBodyFromLocalTemplate : data', data);

  const augmentedData = {
    ...data,
    // add other global context here
  };

  const template = fs.readFileSync(`${__dirname}/${templateName}.html`, 'utf8');

  if (template) {
    let header = '';
    let footer = '';

    if (options.headerOverride) {
      header = fs.readFileSync(`${__dirname}/headers/${options.headerOverride}.html`, 'utf8');
    } else if (values(EmailHeaders).includes(templateName as any)) {
      header = fs.readFileSync(`${__dirname}/headers/${templateName}.html`, 'utf8');
    } else {
      header = fs.readFileSync(`${__dirname}/headers/default.html`, 'utf8');
    }

    if (options.footerOverride) {
      header = fs.readFileSync(`${__dirname}/footers/${options.footerOverride}.html`, 'utf8');
    } else if (values(EmailFooters).includes(templateName as any)) {
      header = fs.readFileSync(`${__dirname}/footers/${templateName}.html`, 'utf8');
    } else {
      header = fs.readFileSync(`${__dirname}/footers/default.html`, 'utf8');
    }

    return mustache.render(template, augmentedData, {
      header,
      footer,
    });
  } else {
    throw new Error(`No email template found for ${templateName}`);
  }
}
