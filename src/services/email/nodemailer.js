import nodemailer, { getTestMessageUrl } from "nodemailer";

//email workflow

//have nodemailer installed
//create transporter
//form the body message
//send mail

const emailProcessor = async (emailBody) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const info = await transporter.sendMail(emailBody);
    getTestMessageUrl(info);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
export const emailVerification = ({ email, fName, url }) => {
  // send mail with defined transport object
  const obj = {
    from: `"Tech Store 👻" <${process.env.SMTP_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "Action Required", // Subject line
    text: ` there, please follow the link to verify your account. ${url}`, // plain text body
    html: `Hello ${fName},
    <br>
    <br>
    Please verify your email.
    <a href=${url} target="_blank">Please click here to verify</a> 
    `, // html body
  };
  emailProcessor(obj);
};
