const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, options = {}) {
    this.to = user.email;
    this.username = user.username;
    this.from = `Boondocks <${process.env.EMAIL_FROM}>`;
    this.course_name = options.course_name;
    this.subject = options.subject;
    this.year_level = options.year_level;
    this.uploaderName = options.uploaderName;
    this.uploaderEmail = options.uploaderEmail;
    this.uploadTime = options.uploadTime;
    this.documentsUrl =
      options.documentsUrl || "https://boondocks.com/questions";
    console.log("Email constructor:", {
      to: this.to,
      username: this.username,
      course_name: this.course_name,
      subject: this.subject,
      year_level: this.year_level,
      uploaderName: this.uploaderName,
      uploaderEmail: this.uploaderEmail,
      uploadTime: this.uploadTime,
      documentsUrl: this.documentsUrl,
      from: this.from,
    });
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      console.log("Using Gmail transport");
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME1,
          pass: process.env.EMAIL_PASSWORD1,
        },
      });
    }
    console.log("Using Mailtrap transport:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USERNAME,
    });
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    console.log(
      "Rendering template:",
      `${__dirname}/../views/email/${template}.pug`
    );
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      username: this.username,
      email: this.to,
      course_name: this.course_name,
      subject: this.subject,
      year_level: this.year_level,
      uploaderName: this.uploaderName,
      uploaderEmail: this.uploaderEmail,
      uploadTime: this.uploadTime,
      documentsUrl: this.documentsUrl,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    console.log("Mail options:", { from: this.from, to: this.to, subject });

    try {
      await this.newTransport().sendMail(mailOptions);
      console.log(`Email sent successfully to ${this.to}`);
    } catch (error) {
      console.error(`Failed to send email to ${this.to}:`, error);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to PastQuestionsHub!");
  }

  async sendDocumentUpload() {
    await this.send(
      "documentUpload",
      "New Document Uploaded to PastQuestionsHub"
    );
  }
};
