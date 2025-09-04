const sgMail = require("@sendgrid/mail");
const { SENDER_EMAIL, SENDGRID_API_KEY } = require("../configs");
const logger = require("./logger");
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailWithTemplate = async ({ toEmail, templateId, dynamicData }) => {
  const msg = {
    to: toEmail,
    from: {
      email: SENDER_EMAIL,
      name: "Clinovia Support",
    },
    templateId: templateId,
    dynamic_template_data: dynamicData,
  };

  try {
    return await sgMail.send(msg);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendEmailWithTemplate,
};
